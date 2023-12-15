// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global storage */
/* exported settings */
const settings = {
    async getAutoUpdate() {
        const autoUpdate = await storage.getItem("autoUpdate");
        return autoUpdate === undefined || autoUpdate === null || autoUpdate === true;
    },
    async setAutoUpdate(update) {
        await storage.setItem("autoUpdate", update);
    },
    async getUpdateFrequencySeconds() {
        const updateFrequencySeconds = Number.parseInt(await storage.getItem("updateFrequencySeconds")) || 86400;
        // We enforce that the automatic update frequency is not less than one hour. (The indices do not update this
        // often.)
        return Math.max(
            updateFrequencySeconds,
            3600,
        );
    },
    async setUpdateFrequencySeconds(updateFrequencySeconds) {
        updateFrequencySeconds = Number.parseInt(updateFrequencySeconds);
        await storage.setItem(
            "updateFrequencySeconds",
            // We enforce that the automatic update frequency is not less than one hour. (The indices do not update this
            // often.)
            Math.max(
                updateFrequencySeconds,
                3600,
            ).toString(),
        );
    },
    async getLastUpdate() {
        const lastUpdate = Number.parseInt(await storage.getItem("lastUpdate")) || 0;
        return new Date(lastUpdate);
    },
    async setLastUpdate(date) {
        await storage.setItem("lastUpdate", date.getTime().toString());
    },
    async lastUpdateNow() {
        const now = new Date();
        await this.setLastUpdate(now);
        return now;
    },
};

/* exported CONSTANTS */
const CONSTANTS = {
    INDEX: {
        BASE_URL: "https://raw.githubusercontent.com/pitkley/aws-search-extension",
        REF: "indices",
        forIndexId(indexId) {
            return `${this.BASE_URL}/${this.REF}/${indexId}.json`;
        },
    },
};
