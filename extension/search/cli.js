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

/* exported CliSearcher */
class CliSearcher extends ServiceOrGlobalOperationSearcher {
    constructor(rawIndex) {
        const {
            services,
            globalSearcher,
            serviceSearcher,
        } = CliSearcher.processRawIndex(rawIndex);

        super("AWS CLI reference docs", "cli", services, globalSearcher, serviceSearcher);
    }

    static processRawIndex(rawIndex) {
        const globalOperationIndex = [];
        const serviceSearchIndex = [];
        const services = {};
        Object.entries(rawIndex).map(([serviceName, operations]) => {
            const operationEntries = Object.entries(operations).map(([operationName, summary]) => ({
                service: serviceName,
                operation: operationName,
                summary,
            })).sort(({operation: a}, {operation: b}) => lengthThenLexicographicSort(a, b));

            // Create per-service searcher
            services[serviceName] = new FuzzySearch(
                operationEntries,
                ["operation", "summary"],
                {sort: true},
            );
            // Add per-service operations to global operation index
            globalOperationIndex.push(...operationEntries);

            // Add service-name to service-search index
            serviceSearchIndex.push({serviceName});
        });
        const globalSearcher = new FuzzySearch(
            globalOperationIndex,
            ["service", "operation", "summary"],
            {sort: true},
        );
        const serviceSearcher = new FuzzySearch(
            serviceSearchIndex,
            ["serviceName"],
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
        } = CliSearcher.processRawIndex(rawIndex);
        this.updateSearcher(services, globalSearcher, serviceSearcher);
    }

    documentationUrl(doc) {
        const stem = doc.operation.replace(" ", "/");
        return `https://docs.aws.amazon.com/cli/latest/reference/${doc.service}/${stem}.html`;
    }

    searchUrl(query) {
        return `https://docs.aws.amazon.com/cli/latest/search.html?q=${query}&check_keywords=yes&area=default`;
    }
}
