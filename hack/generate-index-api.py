#!/usr/bin/env python3.9

import json
from collections import Counter
from dataclasses import dataclass
from enum import Enum, auto
from html.parser import HTMLParser
from pathlib import Path
from typing import Optional


@dataclass
class ServiceOperation:
    name: str
    summary: str
    documentation_url: Optional[str]


@dataclass
class ServiceIndex:
    name: str
    alternative_names: list[str]
    operations: list[ServiceOperation]
    documentation_base_url: Optional[str]

    def final_index(self) -> tuple[list[str], Optional[str], dict[str, tuple[Optional[str], Optional[str]]]]:
        operation_index = {}
        for operation in self.operations:
            operation_index[operation.name] = (operation.summary, operation.documentation_url)
        return self.alternative_names, self.documentation_base_url, operation_index


class DocumentationUrlDetectorHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.detected_urls = Counter()

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        for (attr, value) in attrs:
            if attr == "href":
                href: str = value
                break
        else:
            return
        if not href.startswith("https://docs.aws.amazon.com"):
            return
        detected_url = href.rsplit("/", maxsplit=1)[0] + "/"
        self.detected_urls[detected_url] += 1

    def most_likely_documentation_url(self):
        if len(self.detected_urls) == 0:
            return None
        (url, _count) = self.detected_urls.most_common(1)[0]
        return url


class SummarizationHTMLParser(HTMLParser):
    class State(Enum):
        INITIAL = auto()
        IN_SUMMARY = auto()
        DONE = auto()

    def __init__(self):
        super().__init__()

        self.state = self.State.INITIAL
        self.summary = ""

    def handle_starttag(self, tag, attrs):
        if self.state == self.State.INITIAL and tag == "p":
            self.state = self.State.IN_SUMMARY
            # Reset the summary in case we had read any initial text (i.e. the documentation provided is not HTML).
            self.summary = ""

    def handle_data(self, data):
        if self.state == self.State.INITIAL or self.state == self.State.IN_SUMMARY:
            self.summary += data

    def handle_endtag(self, tag):
        if tag == "p":
            self.state = self.State.DONE


def summarize_documentation(documentation: Optional[str]) -> Optional[str]:
    if not documentation:
        return None

    html_parser = SummarizationHTMLParser()
    html_parser.feed(documentation)
    summary = html_parser.summary.strip()
    if not summary:
        return None
    return summary


def process_service(service_path: Path) -> Optional[ServiceIndex]:
    latest_api_version = max(service_path.iterdir(), key=lambda path: path.name)
    service_file = latest_api_version.joinpath("service-2.json")
    if not service_file.is_file():
        return None
    with service_file.open("r") as fh:
        service = json.load(fh)
    service_name = service_path.name

    if "operations" not in service:
        return None
    operations = []
    documentation_url_html_parser = DocumentationUrlDetectorHTMLParser()
    for operation_name, operation in service["operations"].items():
        documentation = operation.get("documentation", None)
        documentation_summary = summarize_documentation(documentation)
        if documentation:
            documentation_url_html_parser.feed(documentation)
        operations.append(ServiceOperation(
            name=operation_name,
            summary=documentation_summary,
            documentation_url=operation.get("documentationUrl", None),
        ))

    alternative_names = []
    if "metadata" in service:
        for key in (
                "serviceAbbreviation",
                "serviceFullName",
                "serviceId",
                "signingName",
        ):
            if key in service["metadata"]:
                alternative_names.append(service["metadata"][key])

    return ServiceIndex(
        name=service_name,
        alternative_names=alternative_names,
        operations=operations,
        documentation_base_url=documentation_url_html_parser.most_likely_documentation_url(),
    )


def main(botocore_data_root: Path):
    services = {}
    for service_path in botocore_data_root.iterdir():
        if not service_path.is_dir():
            continue
        service_index = process_service(service_path)
        services[service_index.name] = service_index

    # Persist the final-index to the extension
    index_file = Path("extension/index/api.js")
    index_file.parent.mkdir(exist_ok=True)
    with index_file.open("w") as fh:
        fh.write("// Content retrieved from: https://github.com/boto/botocore/\n")
        fh.write("// It is licensed under Apache-2.0, copyright Amazon.com, Inc. or its affiliates.\n")
        fh.write("var apiSearchIndex={\n")
        for service_name, service in services.items():
            fh.write(f"  \"{service_name}\":")
            json.dump(service.final_index(), fh)
            fh.write(",\n")
        fh.write("};")


if __name__ == '__main__':
    main(Path("index-sources/botocore/botocore/data/"))
