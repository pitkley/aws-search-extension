// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

const c = new Compat();
const commandManager = new CommandManager(
    new HelpCommand(),
    new HistoryCommand(),
);

const apiSearcher = new ApiSearcher(apiSearchIndex);
const cfnSearcher = new CfnSearcher(cfnSearchIndex);
const cliSearcher = new CliSearcher(cliSearchIndex);

const defaultSuggestion = `A search-extension for quick, fuzzy-search results for AWS developers!`;
const omnibox = new Omnibox(defaultSuggestion, c.omniboxPageSize());

omnibox.bootstrap({
    onSearch: CfnSearcher.prototype.search.bind(cfnSearcher),
    onFormat: CfnSearcher.prototype.format.bind(cfnSearcher),
    onAppend: CfnSearcher.prototype.append.bind(cfnSearcher),
    afterNavigated: (query, result) => {
        HistoryCommand.record(query, result);
    },
});

omnibox.addRegexQueryEvent(/^[^\/]+\//, {
    onSearch: (query) => {
        const separatorIndex = query.indexOf("/");
        const serviceQueryOrName = query.slice(0, separatorIndex)
        query = query.slice(separatorIndex + 1)
        return apiSearcher.search(serviceQueryOrName, query);
    },
    onFormat: ApiSearcher.prototype.format.bind(apiSearcher),
    onAppend: (query) => {
        const separatorIndex = query.indexOf("/");
        query = query.slice(separatorIndex + 1)
        return apiSearcher.append(query);
    },
});

omnibox.addPrefixQueryEvent("/", {
    onSearch: (query) => {
        query = query.substring(1).trim();
        return apiSearcher.globalSearch(query);
    },
    onFormat: ApiSearcher.prototype.format.bind(apiSearcher),
    onAppend: (query) => {
        query = query.substring(1).trim();
        return apiSearcher.append(query);
    },
});

omnibox.addRegexQueryEvent(/^[^@]+@/, {
    onSearch: (query) => {
        const separatorIndex = query.indexOf("@");
        const serviceQueryOrName = query.slice(0, separatorIndex)
        query = query.slice(separatorIndex + 1)
        return cliSearcher.search(serviceQueryOrName, query);
    },
    onFormat: CliSearcher.prototype.format.bind(cliSearcher),
    onAppend: (query) => {
        const separatorIndex = query.indexOf("@");
        query = query.slice(separatorIndex + 1)
        return cliSearcher.append(query);
    },
});

omnibox.addPrefixQueryEvent("@", {
    onSearch: (query) => {
        query = query.substring(1).trim();
        return cliSearcher.globalSearch(query);
    },
    onFormat: CliSearcher.prototype.format.bind(cliSearcher),
    onAppend: (query) => {
        query = query.substring(1).trim();
        return cliSearcher.append(query);
    },
});

omnibox.addPrefixQueryEvent(":", {
    onSearch: (query) => {
        return commandManager.execute(query);
    }
});

omnibox.addNoCacheQueries(":");
