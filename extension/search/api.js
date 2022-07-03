// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global
     FuzzySearch,
     ServiceOrGlobalOperationSearcher,
     lengthThenLexicographicSort,
*/

/* exported ApiSearcher */
class ApiSearcher extends ServiceOrGlobalOperationSearcher {
    constructor(rawIndex) {
        const {
            services,
            globalSearcher,
            serviceSearcher,
        } = ApiSearcher.processRawIndex(rawIndex);

        super("AWS API reference docs", "api", services, globalSearcher, serviceSearcher);
    }

    static processRawIndex(rawIndex) {
        const globalOperationIndex = [];
        const serviceSearchIndex = [];
        const services = {};
        Object.entries(rawIndex).map(([serviceName, [serviceVersion, alternativeNames, serviceIndex]]) => {
            const operationEntries = Object.entries(serviceIndex).map(([operationName, [summary, documentationUrl]]) => ({
                service: serviceName,
                serviceVersion,
                operation: operationName,
                summary,
                documentationUrl,
            })).sort(({operation: a}, {operation: b}) => lengthThenLexicographicSort(a, b));

            // Create per-service searcher
            services[serviceName] = new FuzzySearch(
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
        const globalSearcher = new FuzzySearch(
            globalOperationIndex,
            ["service", "operation", "summary"],
            {sort: true},
        );
        const serviceSearcher = new FuzzySearch(
            serviceSearchIndex,
            ["alternativeName", "serviceName"],
            {sort: true},
        );

        return {
            services,
            globalSearcher,
            serviceSearcher,
        };
    }

    updateFromRawIndex(rawIndex) {
        const {
            services,
            globalSearcher,
            serviceSearcher,
        } = ApiSearcher.processRawIndex(rawIndex);
        this.updateSearcher(services, globalSearcher, serviceSearcher);
    }

    documentationUrl(doc) {
        if (doc.documentationUrl)
            return doc.documentationUrl;
        return `https://docs.aws.amazon.com/goto/WebAPI/${doc.service}-${doc.serviceVersion}/${doc.operation}`;
    }

    searchUrl(query) {
        return `https://docs.aws.amazon.com/search/doc-search.html?searchPath=documentation-guide&searchQuery=${query}&this_doc_guide=API%20Reference#facet_doc_guide=API%20Reference`;
    }
}
