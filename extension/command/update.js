// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global
     c,
     settings,
*/

/* exported UpdateCommand */
class UpdateCommand extends Command {
    constructor(searchers) {
        super("update", "Update indices");
        this.searchers = searchers;
    }

    onEnter(_content, _disposition) {
        this.scheduleIndexUpdates(false);
    }

    onBlankResult(_arg) {
        let lastUpdate = settings.lastUpdate;
        if (lastUpdate.getTime() === 0) {
            lastUpdate = "never";
        }

        return [{
            content: "!update",
            description: `Press ${c.match("Enter")} to update the search indices.`,
        }, {
            content: "!update",
            description: `Last update: ${c.match(lastUpdate)}`,
        }];
    }

    async scheduleIndexUpdates(implicit = true) {
        const lastUpdate = settings.lastUpdate;

        // If the update was requested implicitly (i.e. through an Omnibox-hook) where the user did not explicitly
        // request the update, we will only perform the update if the `autoUpdate` setting is enabled.
        if (implicit) {
            if (!settings.autoUpdate) {
                return lastUpdate;
            }

            // Before updating we verify that the last update happened at least as long ago as configured.
            const nowEpoch = new Date().getTime();
            const lastUpdateEpoch = lastUpdate.getTime();
            if (nowEpoch - lastUpdateEpoch < (settings.updateFrequencySeconds * 1000)) {
                return lastUpdate;
            }
        }

        await Promise.all(this.searchers.map(searcher => searcher.updateIndexFromGithub()));
        return settings.lastUpdateNow();
    }
}
