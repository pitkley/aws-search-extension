// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

class ApiSearcher {
    constructor(rawIndex) {
        const globalOperationIndex = [];
        const serviceSearchIndex = [];
        this.services = {};
        Object.entries(rawIndex).map(([serviceName, [alternativeNames, documentationBaseUrl, serviceIndex]]) => {
            const operationEntries = Object.entries(serviceIndex).map(([operationName, [summary, documentationUrl]]) => ({
                service: serviceName,
                operation: operationName,
                summary,
                documentationBaseUrl,
                documentationUrl,
            })).sort(({operation: a}, {operation: b}) => lengthThenLexicographicSort(a, b));

            // Create per-service searcher
            this.services[serviceName] = new FuzzySearch(
                operationEntries,
                ["operation", "summary"],
                {sort: true},
            );
            // Add per-service operations to global operation index
            globalOperationIndex.push(...operationEntries);

            // Add alternative service names to service-search
            for (const alternativeName of alternativeNames) {
                serviceSearchIndex.push({alternativeName, serviceName});
            }

        });
        this.globalSearcher = new FuzzySearch(
            globalOperationIndex,
            ["service", "operation", "summary"],
            {sort: true},
        );
        this.serviceSearcher = new FuzzySearch(
            serviceSearchIndex,
            ["alternativeName", "serviceName"],
            {sort: true},
        );
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
            return [...new Set(serviceCandidates.map(({serviceName}) => serviceName))].flatMap((serviceName) => {
                return this.services[serviceName].search(query);
            }).sort(({operation: a}, {operation: b}) => lengthThenLexicographicSort(a, b));
        }
    }

    format(index, doc) {
        let documentationUrl = doc.documentationUrl;
        if (!documentationUrl) {
            if (doc.documentationBaseUrl) {
                documentationUrl = `${doc.documentationBaseUrl}API_${doc.operation}.html`;
            } else {
                documentationUrl = ApiSearcher.searchUrl(`${doc.service} ${doc.operation}`);
            }
        }
        return {
            content: documentationUrl,
            description: `[${c.match(c.escape(doc.service))}] ${c.match(c.escape(doc.operation))} - ${c.dim(c.escape(doc.summary))}`,
        };
    }

    append(query) {
        return [{
            content: ApiSearcher.searchUrl(query),
            description: `Search AWS API reference docs for ${c.match(c.escape(query))}`,
        }];
    }

    static searchUrl(query) {
        return `https://docs.aws.amazon.com/search/doc-search.html?searchPath=documentation-guide&searchQuery=${query}&this_doc_guide=API%20Reference#facet_doc_guide=API%20Reference`;
    }
}
