// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global
     CONSTANTS,
     FuzzySearch,
     c,
     lengthThenLexicographicSort,
*/

/* exported CfnSearcher */
class CfnSearcher {
    constructor(rawIndex) {
        this.updateFromRawIndex(rawIndex);
    }

    static processRawIndex(rawIndex) {
        const index = Object.entries(rawIndex).map(([name, [path, description, source]]) => {
            return {
                name,
                path,
                description,
                source,
            };
        }).sort(({name: a}, {name: b}) => lengthThenLexicographicSort(a, b));
        const searcher = new FuzzySearch(
            index,
            ["name", "description"],
            {sort: true},
        );

        return {searcher};
    }

    updateSearcher(searcher) {
        this.searcher = searcher;
    }

    updateFromRawIndex(rawIndex) {
        const {searcher} = CfnSearcher.processRawIndex(rawIndex);
        this.updateSearcher(searcher);
    }

    async updateIndexFromGithub() {
        // Retrieve pre-built JSON-index from GitHub.
        const response = await fetch(CONSTANTS.INDEX.forIndexId("cfn"));
        const indexData = await response.json();

        // Store the index in the extension-storage.
        await browser.storage.local.set({"index-cfn": indexData});

        // Update the current searcher with the new index.
        this.updateFromRawIndex(indexData);
    }

    search(query) {
        return this.searcher.search(query);
    }

    format(index, doc) {
        let content;
        let description = `${c.match(c.escape(doc.name))} - ${c.dim(c.escape(doc.description))}`;
        if (doc.source === "sam") {
            content = `https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/${doc.path}.html`;
            description = "[SAM] " + description;
        } else {
            content = `https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/${doc.path}.html`;
            description = "[CFN] " + description;
        }

        return {
            content,
            description,
        };
    }

    append(query) {
        return [{
            content: `https://docs.aws.amazon.com/search/doc-search.html?searchPath=documentation-guide&searchQuery=${query}&this_doc_product=AWS%20CloudFormation&this_doc_guide=User%20Guide#facet_doc_product=AWS%20CloudFormation&facet_doc_guide=User%20Guide`,
            description: `Search AWS CloudFormation docs for ${c.match(c.escape(query))}`,
        }];
    }
}
