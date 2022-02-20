#!/usr/bin/env python3

# Copyright Pit Kleyersburg <pitkley@googlemail.com>
#
# Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
# http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
# <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
# option. This file may not be copied, modified or distributed
# except according to those terms.

import json
import sys
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
    version: str
    alternative_names: list[str]
    operations: list[ServiceOperation]

    def final_index(self) -> tuple[str, list[str], dict[str, tuple[Optional[str], Optional[str]]]]:
        operation_index = {}
        for operation in self.operations:
            operation_index[operation.name] = (operation.summary, operation.documentation_url)
        return self.version, self.alternative_names, operation_index


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
    for operation_name, operation in service["operations"].items():
        documentation = operation.get("documentation", None)
        documentation_summary = summarize_documentation(documentation)
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
        version=latest_api_version.name,
        alternative_names=alternative_names,
        operations=operations,
    )


def main(
    botocore_data_root: Path,
    *,
    export_as_json: bool,
):
    services = {}
    for service_path in botocore_data_root.iterdir():
        if not service_path.is_dir():
            continue
        service_index = process_service(service_path)
        services[service_index.name] = service_index

    # Persist the final-index to the extension
    index_file = Path("json-indices/api.json") if export_as_json else Path("extension/index/api.js")
    index_file.parent.mkdir(exist_ok=True)
    with index_file.open("w") as fh:
        if not export_as_json:
            fh.write("// Content retrieved from: https://github.com/boto/botocore/\n")
            fh.write("// It is licensed under Apache-2.0, copyright Amazon.com, Inc. or its affiliates.\n")
            fh.write("var apiSearchIndex={\n")
        else:
            fh.write("{\n")

        service_count = len(services.keys())
        for index, (service_name, service) in enumerate(sorted(services.items()), start=1):
            fh.write(f"  \"{service_name}\":")
            json.dump(service.final_index(), fh, sort_keys=True)
            if not export_as_json or index != service_count:
                fh.write(",")
            fh.write("\n")

        fh.write("}")
        if not export_as_json:
            fh.write(";")


if __name__ == '__main__':
    if sys.version_info.major < 3 or (sys.version_info.major == 3 and sys.version_info.minor <= 9):
        sys.exit("Python 3.9+ required")

    export_as_json = "--export-as-json" in sys.argv
    main(
        Path("index-sources/botocore/botocore/data/"),
        export_as_json=export_as_json,
    )
