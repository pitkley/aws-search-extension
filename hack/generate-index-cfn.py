#!/usr/bin/env python3.9

# Copyright Pit Kleyersburg <pitkley@googlemail.com>
#
# Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
# http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
# <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
# option. This file may not be copied, modified or distributed
# except according to those terms.

import json
from collections import defaultdict
from dataclasses import dataclass
from enum import Enum, auto
from pathlib import Path
from typing import Optional


class State(Enum):
    ITEM = auto()
    DESCRIPTION = auto()


@dataclass
class IndexItem:
    name: str
    path: Path
    description: str


def process_path(path: Path) -> Optional[IndexItem]:
    with open(path, "r") as fh:
        parse_state = State.ITEM
        item = None
        for line in fh.readlines():
            if parse_state == State.ITEM:
                if not line.startswith("# "):
                    continue
                item = line.removeprefix("# ").split("<", maxsplit=1)[0].strip()
                parse_state = State.DESCRIPTION
            elif parse_state == State.DESCRIPTION:
                line = line.strip()
                if line == "":
                    continue
                description = line.replace("\\", "")
                break
        else:
            # If we reach this `else`, the for-loop exited normally, which means we did not identify both an item and a
            # description. If we are just missing the description, we take the item name. If we are missing both, we
            # can't return a valid `IndexItem`.
            if item is None:
                return None
            description = item
    return IndexItem(name=item, path=path, description=description)


def main(cfn_docs_root: Path):
    # Generate the internal index representation for the available files
    index = defaultdict(list)
    for path in cfn_docs_root.iterdir():
        if not path.is_file():
            continue
        index_item = process_path(path)
        if not index_item:
            continue
        index[index_item.name].append(index_item)

    # Convert the internal index representation into the final, simpler representation used by the extension.
    final_index = {}
    for key, index_items in index.items():
        if len(index_items) <= 0:
            continue
        elif len(index_items) == 1:
            index_item = index_items[0]
            final_index[key] = [
                index_item.path.stem,
                index_item.description,
            ]
        else:
            # We have two or more items that share the same name. To be able to show all of them, we add their filename
            # to the item name.
            for index_item in index_items:
                compound_key = f"{key} - {index_item.path.stem}"
                final_index[compound_key] = [
                    index_item.path.stem,
                    index_item.description,
                ]

    # Persist the final-index to the extension
    index_file = Path("extension/index/cfn.js")
    index_file.parent.mkdir(exist_ok=True)
    with index_file.open("w") as fh:
        fh.write("// Descriptions retrieved from: https://github.com/awsdocs/aws-cloudformation-user-guide/\n")
        fh.write("// They are licensed under the Creative Commons Attribution-ShareAlike 4.0 International Public License, copyright Amazon Web Services, Inc.\n")
        fh.write("var cfnSearchIndex=")
        json.dump(sorted(final_index), fh, sort_keys=True)
        fh.write(";\n")


if __name__ == '__main__':
    main(Path("index-sources/aws-cloudformation-user-guide/doc_source"))
