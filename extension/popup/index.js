// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global settings */

document.addEventListener("DOMContentLoaded", async function () {
    const autoUpdateCheckbox = document.getElementById("autoUpdateCheckbox");
    autoUpdateCheckbox.checked = await settings.getAutoUpdate();
    autoUpdateCheckbox.onchange = async function (event) {
        await settings.setAutoUpdate(event.target.checked);
    };

    const updateFrequencySecondsInput = document.getElementById("updateFrequencySecondsInput");
    updateFrequencySecondsInput.value = await settings.getUpdateFrequencySeconds();
    updateFrequencySecondsInput.onchange = async function (event) {
        await settings.setUpdateFrequencySeconds(event.target.value);
    };

    const refreshLastIndexUpdate = async (error) => {
        let lastUpdate;
        if (error !== undefined) {
            lastUpdate = error;
        } else {
            lastUpdate = await settings.getLastUpdate();
            if (lastUpdate.getTime() === 0) {
                lastUpdate = "never";
            }
        }

        for (const element of document.getElementsByClassName("lastIndexUpdate")) {
            element.innerText = lastUpdate;
        }
    };
    refreshLastIndexUpdate();

    const lastIndexUpdateCell = document.getElementById("lastIndexUpdateCell");
    const handleScheduleIndexUpdates = async () => {
        lastIndexUpdateCell.classList.remove("error");
        lastIndexUpdateCell.classList.add("updating");

        const {error} = await browser.runtime.sendMessage({action: "scheduleIndexUpdates"});

        lastIndexUpdateCell.classList.remove("updating");

        if (error !== undefined) {
            lastIndexUpdateCell.classList.add("error");
            refreshLastIndexUpdate(`Failed to update indices: ${error}`);
        } else {
            refreshLastIndexUpdate();
        }
        return false;
    };
    const scheduleIndexUpdatesButton = document.getElementById("scheduleIndexUpdatesButton");
    const scheduleIndexUpdatesText = document.getElementById("scheduleIndexUpdatesText");
    scheduleIndexUpdatesButton.onclick = handleScheduleIndexUpdates;
    scheduleIndexUpdatesText.onclick = handleScheduleIndexUpdates;

    const extensionVersion = `v${browser.runtime.getManifest().version}`;
    for (const element of document.getElementsByClassName("version")) {
        element.innerText = extensionVersion;
    }

    window.addEventListener("storage", async function () {
        autoUpdateCheckbox.checked = await settings.getAutoUpdate();
        updateFrequencySecondsInput.value = await settings.getUpdateFrequencySeconds();
    });
});
