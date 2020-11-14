// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

class CfnSearcher {
    constructor(rawIndex) {
        this.index = rawIndex;
        this.docs = Object.keys(this.index);
    }

    // Search logic adopted from: https://github.com/huhu/cpp-search-extension/blob/242b89d5e03919438035d2cdb1990be6f99376f5/extension/search/std.js
    // Licensed under Apache 2.0, Copyright huhu.io
    search(query) {
        query = query.toLowerCase();
        let result = [];
        for (let doc of this.docs) {
            if (doc.length < query.length) continue;

            let index = doc.toLowerCase().indexOf(query);
            if (index !== -1) {
                result.push({
                    name: doc,
                    matchIndex: index,
                });
            }
        }

        return result.sort((a, b) => {
            if (a.matchIndex === b.matchIndex) {
                return a.name.length - b.name.length;
            }
            return a.matchIndex - b.matchIndex;
        }).map(item => {
            let [path, description] = this.index[item.name];
            return {
                name: item.name,
                path,
                description,
            };
        })
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
