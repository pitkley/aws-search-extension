// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

class ServiceOrGlobalOperationSearcher {
    constructor(name, services, globalSearcher, serviceSearcher) {
        this.name = name;
        this.services = services;
        this.globalSearcher = globalSearcher;
        this.serviceSearcher = serviceSearcher;
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

    documentationUrl(doc) {
    }

    searchUrl(query) {
    }
}
