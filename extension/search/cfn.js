// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

class CfnSearcher {
    constructor(rawIndex) {
        this.index = Object.entries(rawIndex).map(([name, [path, description]]) => {
            return {
                name,
                path,
                description,
            };
        }).sort(({name: a}, {name: b}) => lengthThenLexicographicSort(a, b));
        this.searcher = new FuzzySearch(
            this.index,
            ["name", "description"],
            {sort: true},
        );
    }

    search(query) {
        return this.searcher.search(query);
    }

    format(index, doc) {
        return {
            content: `https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/${doc.path}.html`,
            description: `[CFN] ${c.match(c.escape(doc.name))} - ${c.dim(c.escape(doc.description))}`,
        };
    }

    append(query) {
        return [{
            content: `https://docs.aws.amazon.com/search/doc-search.html?searchPath=documentation-guide&searchQuery=${query}&this_doc_product=AWS%20CloudFormation&this_doc_guide=User%20Guide#facet_doc_product=AWS%20CloudFormation&facet_doc_guide=User%20Guide`,
            description: `Search AWS CloudFormation docs for ${c.match(c.escape(query))}`,
        }];
    }
}
