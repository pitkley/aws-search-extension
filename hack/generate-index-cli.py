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


@dataclass
class ServiceIndex:
    name: str
    operations: list[ServiceOperation]

    def final_index(self) -> dict[str, str]:
        return {operation.name: operation.summary for operation in self.operations}


class SummarizationHTMLParser(HTMLParser):
    """
    The summary of a CLI operation is the first <p> element in the <div id="description">. This parser is set up to
    extract exactly that element.
    """

    class State(Enum):
        INITIAL = auto()
        IN_DESCRIPTION = auto()
        IN_SUMMARY = auto()
        DONE = auto()

    def __init__(self):
        super().__init__()

        self.state = self.State.INITIAL
        self.summary = ""

    def handle_starttag(self, tag, attrs):
        if self.state == self.State.INITIAL and tag == "div":
            attrs = dict(attrs)
            if attrs.get("id", None) == "description":
                self.state = self.State.IN_DESCRIPTION
                return
        elif self.state == self.State.IN_DESCRIPTION and tag == "p":
            self.state = self.State.IN_SUMMARY

    def handle_data(self, data):
        if self.state == self.State.IN_SUMMARY:
            self.summary += data

    def handle_endtag(self, tag):
        if self.state == self.State.IN_SUMMARY and tag == "p":
            self.state = self.State.DONE


def process_operation(operation_path: Path, prefixes: list) -> list[ServiceOperation]:
    operations = []

    if operation_path.is_dir():
        for child_path in operation_path.iterdir():
            operations.extend(process_operation(child_path, prefixes + [operation_path.name]))
        return operations
    if not operation_path.is_file():
        return operations
    if not operation_path.name.endswith(".fjson"):
        return operations
    if operation_path.name == "index.fjson":
        return operations

    with operation_path.open("r") as fh:
        operation = json.load(fh)

    html_parser = SummarizationHTMLParser()
    html_parser.feed(operation["body"])
    operation_name = " ".join(prefixes + [operation["title"]])
    operations.append(ServiceOperation(
        name=operation_name,
        summary=html_parser.summary,
    ))

    return operations


def process_service(service_path: Path) -> Optional[ServiceIndex]:
    operations = []
    for operation_file in service_path.iterdir():
        operations.extend(process_operation(operation_file, []))

    if not operations:
        return None
    return ServiceIndex(
        name=service_path.name,
        operations=operations,
    )


def main(
    awscli_docs_root: Path,
    *,
    export_as_json: bool,
):
    if not awscli_docs_root.is_dir():
        print("The aws-cli documentation directory does not exist. Have you built the docs?", file=sys.stderr)
        print("  cd index-sources/aws-cli/", file=sys.stderr)
        print("  pip install -r requirements.txt", file=sys.stderr)
        print("  pip install -r requirements-docs.txt", file=sys.stderr)
        print("  pip install -e .", file=sys.stderr)
        print("  cd doc/", file=sys.stderr)
        print("  env PYTHONWARNINGS= make json", file=sys.stderr)
        sys.exit(1)

    services = {}
    for service_path in awscli_docs_root.iterdir():
        if not service_path.is_dir():
            continue
        print(f"Generating {service_path.name}...")
        service_index = process_service(service_path)
        if not service_index:
            continue
        services[service_index.name] = service_index

    # Persist the final-index to the extension
    index_file = Path("json-indices/cli.json") if export_as_json else Path("extension/index/cli.js")
    index_file.parent.mkdir(exist_ok=True)
    with index_file.open("w") as fh:
        if not export_as_json:
            fh.write("// Content retrieved from: https://github.com/aws/aws-cli/\n")
            fh.write("// It is licensed under Apache-2.0, copyright Amazon.com, Inc. or its affiliates.\n")
            fh.write("var cliSearchIndex={\n")
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


if __name__ == "__main__":
    if sys.version_info.major < 3 or (
        sys.version_info.major == 3 and sys.version_info.minor < 9
    ):
        sys.exit(
            f"Python 3.9+ required. Currently running on:\n\nPython {sys.version})"
        )

    export_as_json = "--export-as-json" in sys.argv
    main(
        Path("index-sources/aws-cli/doc/build/json/reference/"),
        export_as_json=export_as_json,
    )
