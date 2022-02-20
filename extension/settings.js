// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

const settings = {
    get autoUpdate() {
        const autoUpdate = localStorage.getItem("autoUpdate");
        return autoUpdate === null || autoUpdate === "true";
    },
    set autoUpdate(update) {
        localStorage.setItem("autoUpdate", update);
    },
    get updateFrequencySeconds() {
        const updateFrequencySeconds = Number.parseInt(localStorage.getItem("updateFrequencySeconds")) || 86400;
        // We enforce that the automatic update frequency is not less than one hour. (The indices do not update this
        // often.)
        return Math.max(
            updateFrequencySeconds,
            3600,
        )
    },
    set updateFrequencySeconds(updateFrequencySeconds) {
        updateFrequencySeconds = Number.parseInt(updateFrequencySeconds)
        localStorage.setItem(
            "updateFrequencySeconds",
            // We enforce that the automatic update frequency is not less than one hour. (The indices do not update this
            // often.)
            Math.max(
                updateFrequencySeconds,
                3600,
            ).toString(),
        );
    },
    get lastUpdate() {
        let lastUpdate = Number.parseInt(localStorage.getItem("lastUpdate")) || 0;
        return new Date(lastUpdate);
    },
    set lastUpdate(date) {
        localStorage.setItem("lastUpdate", date.getTime().toString())
    },
    lastUpdateNow() {
        const now = new Date();
        this.lastUpdate = now;
        return now;
    },
};

const CONSTANTS = {
    INDEX: {
        BASE_URL: "https://raw.githubusercontent.com/pitkley/aws-search-extension",
        REF: "indices",
        forIndexId(indexId) {
            return `${this.BASE_URL}/${this.REF}/${indexId}.json`;
        }
    }
}
