#!/usr/bin/env python3

# Copyright Pit Kleyersburg <pitkley@googlemail.com>
#
# Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
# http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
# <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
# option. This file may not be copied, modified or distributed
# except according to those terms.

from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import json
import sys


SCRIPT_DIRECTORY = Path(__file__).parent
CLOUDSPECS_PATH = (
    SCRIPT_DIRECTORY.parent
    / "index-sources"
    / "cfn-lint"
    / "src"
    / "cfnlint"
    / "data"
    / "CloudSpecs"
)
SAM_PATH = SCRIPT_DIRECTORY.parent / "index-sources" / "sam.json"
CFN_USER_GUIDE_PREFIX = (
    "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/"
)
SAM_USER_GUIDE_PREFIX = (
    "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/"
)
SAM_USER_GUIDE_URL = f"{SAM_USER_GUIDE_PREFIX}{{filename}}.html"


@dataclass
class Item:
    name: str
    documentation_url: str
    source: str
    summary: Optional[str] = None


def get_items_from_cloudspecs() -> dict[str, Item]:
    print("Reading CloudSpecs")
    items = {}

    for cloudspec_path in CLOUDSPECS_PATH.glob("*.json"):
        with cloudspec_path.open("r") as fh:
            cloudspec = json.load(fh)

        for resource_name, resource in cloudspec["ResourceTypes"].items():
            if resource == "CACHED":
                continue

            if resource_name not in items:
                items[resource_name] = Item(
                    name=resource_name,
                    documentation_url=resource["Documentation"].replace(
                        "http://", "https://"
                    ),
                    source="cfn",
                )

            if properties := resource.get("Properties"):
                for property_name, property in properties.items():
                    item_name = f"{resource_name} {property_name}"

                    if item_name in items:
                        continue
                    if property == "CACHED":
                        continue
                    if "Documentation" not in property:
                        print(f" - Skipping {item_name} (no documentation)")
                        continue

                    items[item_name] = Item(
                        name=item_name,
                        documentation_url=property["Documentation"].replace(
                            "http://", "https://"
                        ),
                        source="cfn",
                    )

        for property_name, property in cloudspec["PropertyTypes"].items():
            if property_name in items:
                continue
            if property == "CACHED":
                continue
            if "Documentation" not in property:
                print(f" - Skipping {property_name} (no documentation)")
                continue

            items[property_name] = Item(
                name=property_name,
                documentation_url=property["Documentation"].replace(
                    "http://", "https://"
                ),
                source="cfn",
            )

        for intrinsic_name, intrinsic in cloudspec["IntrinsicTypes"].items():
            if intrinsic == "CACHED":
                continue
            if intrinsic_name in items:
                continue

            items[intrinsic_name] = Item(
                name=intrinsic_name,
                documentation_url=intrinsic["Documentation"].replace(
                    "http://", "https://"
                ),
                source="cfn",
            )
    if not items:
        raise RuntimeError(
            "No items found. This could indicate that the CloudSpecs have "
            "moved within the cfn-lint repository."
        )

    return items


def enrich_with_sam_items(items):
    print("Reading SAM items")
    with SAM_PATH.open("r") as fh:
        sam = json.load(fh)

    for item_name, item in sam["items"].items():
        if item_name in items:
            print(f" - Skipping {item_name} (already in CloudSpecs)")
            continue
        items[item_name] = Item(
            name=item_name,
            documentation_url=SAM_USER_GUIDE_URL.format(filename=item["filename"]),
            source="sam",
            summary=item["description"],
        )

    return sam["_attribution"]


def write_index_v1(items: dict[str, Item], *, export_as_json: bool) -> None:
    if not export_as_json:
        print("Skipping JS file for index v1 (should not be bundled anymore)")
        return

    output_path = Path("json-indices/cfn.json")
    output_path.parent.mkdir(exist_ok=True)

    print(f"Writing index v1 to {output_path}")

    with output_path.open("w") as fh:
        fh.write("{\n")

        item_count = len(items.keys())
        for index, (item_name, item) in enumerate(sorted(items.items()), start=1):
            if not item.documentation_url.startswith(
                CFN_USER_GUIDE_PREFIX
            ) and not item.documentation_url.startswith(SAM_USER_GUIDE_PREFIX):
                print(
                    f" - Skipping {item_name}, doc-URL not compatible with v1 index: {item.documentation_url}"
                )
                continue

            fh.write(f"  {json.dumps(item_name)}:")

            documentation_path = item.documentation_url.removeprefix(
                CFN_USER_GUIDE_PREFIX
            )
            documentation_path = documentation_path.removeprefix(SAM_USER_GUIDE_PREFIX)
            documentation_path = documentation_path.split(".html")[0]
            json.dump(
                [
                    documentation_path,
                    item.summary if item.summary else "",
                    item.source,
                ],
                fh,
            )
            if index != item_count:
                fh.write(",")
            fh.write("\n")

        fh.write("}")


def write_index_v2(
    items: dict[str, Item],
    sam_attribution,
    *,
    export_as_json: bool,
) -> None:
    output_path = (
        Path("json-indices/cfn.v2.json")
        if export_as_json
        else Path("extension/index/cfn.v2.js")
    )
    output_path.parent.mkdir(exist_ok=True)

    print(f"Writing index v2 to {output_path}")

    with output_path.open("w") as fh:
        if not export_as_json:
            fh.write("// Structure for CloudFormation-items retrieved from:\n")
            fh.write(f"// - https://github.com/aws-cloudformation/cfn-lint\n")
            fh.write("// They are licensed under MIT No Attribution.\n")
            fh.write("//\n")
            fh.write("// Structure and descriptions for SAM-items retrieved from:\n")
            fh.write(f"// - {sam_attribution['ContentRetrievedFrom']}\n")
            fh.write(
                f"// They are licensed under {sam_attribution['License']}, {sam_attribution['Copyright']}\n"
            )
            fh.write("var cfnV2SearchIndex={\n")
        else:
            fh.write("{\n")

        item_count = len(items.keys())
        for index, (item_name, item) in enumerate(sorted(items.items()), start=1):
            fh.write(f"  {json.dumps(item_name)}:")

            json.dump(
                [
                    item.documentation_url,
                    item.summary,
                    item.source,
                ],
                fh,
            )
            if not export_as_json or index != item_count:
                fh.write(",")
            fh.write("\n")

        fh.write("}")
        if not export_as_json:
            fh.write(";\n")


def main(
    *,
    export_as_json: bool,
):
    items = get_items_from_cloudspecs()
    sam_attribution = enrich_with_sam_items(items)
    write_index_v1(items, export_as_json=export_as_json)
    write_index_v2(items, sam_attribution, export_as_json=export_as_json)


if __name__ == "__main__":
    if sys.version_info.major < 3 or (
        sys.version_info.major == 3 and sys.version_info.minor < 9
    ):
        sys.exit(
            f"Python 3.9+ required. Currently running on:\n\nPython {sys.version})"
        )

    export_as_json = "--export-as-json" in sys.argv
    main(export_as_json=export_as_json)
