// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global
    ApiSearcher,
    CfnSearcher,
    CliSearcher,
    CommandManager,
    Compat,
    HelpCommand,
    HistoryCommand,
    Omnibox,
    UpdateCommand,
    apiSearchIndex,
    cfnV2SearchIndex,
    cliSearchIndex,
    storageGetOrDefault,
*/

const COMMAND_PREFIX = "!";
const c = new Compat();
(async () => {
    const apiSearcher = new ApiSearcher(await storageGetOrDefault("index-api", apiSearchIndex));
    const cfnSearcher = new CfnSearcher(await storageGetOrDefault("index-cfn", cfnV2SearchIndex));
    const cliSearcher = new CliSearcher(await storageGetOrDefault("index-cli", cliSearchIndex));

    const updateCommand = new UpdateCommand([
        apiSearcher,
        cfnSearcher,
        cliSearcher,
    ]);

    const commandManager = new CommandManager(
        COMMAND_PREFIX,
        new HelpCommand(),
        new HistoryCommand(),
        updateCommand,
    );

    const defaultSuggestion = "A search-extension for quick, fuzzy-search results for AWS developers!";
    const omnibox = new Omnibox(defaultSuggestion, c.omniboxPageSize());

    omnibox.bootstrap({
        onSearch: ApiSearcher.prototype.globalSearch.bind(apiSearcher),
        onFormat: ApiSearcher.prototype.format.bind(apiSearcher),
        onAppend: ApiSearcher.prototype.append.bind(apiSearcher),
        onEmptyNavigate: (content, disposition) => {
            commandManager.handleCommandEnterEvent(content, disposition);
        },
        afterNavigated: (query, result) => {
            if (query && !query.startsWith(COMMAND_PREFIX) && result) {
                HistoryCommand.record(query, result);
            }
            updateCommand.scheduleIndexUpdates(true);
        },
    });

    omnibox.addPrefixQueryEvent(":", {
        onSearch: (query) => {
            query = query.substring(1).trim();
            return cfnSearcher.search(query);
        },
        onFormat: CfnSearcher.prototype.format.bind(cfnSearcher),
        onAppend: (query) => {
            query = query.substring(1).trim();
            return cfnSearcher.append(query);
        },
    });
    omnibox.addRegexQueryEvent(/::/, {
        onSearch: CfnSearcher.prototype.search.bind(cfnSearcher),
        onFormat: CfnSearcher.prototype.format.bind(cfnSearcher),
        onAppend: CfnSearcher.prototype.append.bind(cfnSearcher),
    });

    omnibox.addRegexQueryEvent(/^[^/]+\//, {
        onSearch: (query) => {
            const separatorIndex = query.indexOf("/");
            const serviceQueryOrName = query.slice(0, separatorIndex);
            query = query.slice(separatorIndex + 1);
            return apiSearcher.search(serviceQueryOrName, query);
        },
        onFormat: ApiSearcher.prototype.format.bind(apiSearcher),
        onAppend: (query) => {
            const separatorIndex = query.indexOf("/");
            query = query.slice(separatorIndex + 1);
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
            const serviceQueryOrName = query.slice(0, separatorIndex);
            query = query.slice(separatorIndex + 1);
            return cliSearcher.search(serviceQueryOrName, query);
        },
        onFormat: CliSearcher.prototype.format.bind(cliSearcher),
        onAppend: (query) => {
            const separatorIndex = query.indexOf("@");
            query = query.slice(separatorIndex + 1);
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

    omnibox.addPrefixQueryEvent(COMMAND_PREFIX, {
        onSearch: (query) => {
            return commandManager.execute(query);
        },
    });

    omnibox.addNoCacheQueries(COMMAND_PREFIX);

    const messageHandler = async ({ action, ...rest }, _sender) => {
        switch (action) {
        case "scheduleIndexUpdates":
            return updateCommand.scheduleIndexUpdates(false)
                .then(lastUpdate => {
                    return { lastUpdate };
                })
                .catch(error => {
                    return { error: error.message };
                });
        default:
            console.error(`Received message for unknown action '${action}'`);
            return Promise.resolve({
                error: "Unknown action",
            });
        }
    };
    browser.runtime.onMessage.addListener(messageHandler);
})();
