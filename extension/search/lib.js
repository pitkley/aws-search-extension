// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global
     CONSTANTS,
     c,
     lengthThenLexicographicSort,
*/

/* exported ServiceOrGlobalOperationSearcher */
class ServiceOrGlobalOperationSearcher {
    constructor(name, indexId, services, globalSearcher, serviceSearcher) {
        this.name = name;
        this.indexId = indexId;
        this.updateSearcher(services, globalSearcher, serviceSearcher);
    }

    updateSearcher(services, globalSearcher, serviceSearcher) {
        this.services = services;
        this.globalSearcher = globalSearcher;
        this.serviceSearcher = serviceSearcher;
    }

    updateFromRawIndex(_rawIndex) {
    }

    async updateIndexFromGithub() {
        // Retrieve pre-built JSON-index from GitHub.
        const response = await fetch(CONSTANTS.INDEX.forIndexId(this.indexId));
        if (response.status >= 400) {
            throw new Error(`Could not retrieve index file for ${this.indexId}-index, returned status: ${response.status} ${response.statusText}`);
        }
        const indexData = await response.json();

        // Store the index in the extension-storage.
        await browser.storage.local.set({ [`index-${this.indexId}`]: indexData });

        // Update the current searcher with the new index.
        this.updateFromRawIndex(indexData);
    }

    globalSearch(query) {
        return this.globalSearcher.search(query);
    }

    search(serviceQueryOrName, query) {
        if (serviceQueryOrName in this.services) {
            return this.services[serviceQueryOrName].search(query);
        } else {
            const serviceCandidates = this.serviceSearcher.search(serviceQueryOrName);
            if (!serviceCandidates) {
                return [];
            }
            return [...new Set(serviceCandidates.map(({ serviceName }) => serviceName))].flatMap((serviceName) => {
                return this.services[serviceName].search(query);
            }).sort(({ operation: a }, { operation: b }) => lengthThenLexicographicSort(a, b));
        }
    }

    format(index, doc) {
        let documentationUrl = this.documentationUrl(doc);
        return {
            content: documentationUrl,
            description: `[${c.match(c.escape(doc.service))}] ${c.match(c.escape(doc.operation))} - ${c.dim(c.escape(doc.summary))}`,
        };
    }

    append(query) {
        return [{
            content: this.searchUrl(query),
            description: `Search ${this.name} for ${c.match(c.escape(query))}`,
        }];
    }

    documentationUrl(_doc) {
    }

    searchUrl(_query) {
    }
}
