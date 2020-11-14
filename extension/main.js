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

const cfnSearcher = new CfnSearcher(cfnSearchIndex);

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

omnibox.addPrefixQueryEvent(":", {
    onSearch: (query) => {
        return commandManager.execute(query);
    }
});

omnibox.addNoCacheQueries(":");
