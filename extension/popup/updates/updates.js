// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global settings */

document.addEventListener("DOMContentLoaded", async function () {
    const h1 = document.getElementsByTagName("h1")[0];
    h1.innerText += ` to v${browser.runtime.getManifest().version}`;
    const changesH2 = document.querySelector("h2#changes");
    if (changesH2 != null) {
        changesH2.innerText += ` in v${browser.runtime.getManifest().version}`;
    }

    const autoUpdateCheckbox = document.getElementById("autoUpdateCheckbox");
    if (autoUpdateCheckbox !== null) {
        autoUpdateCheckbox.checked = await settings.getAutoUpdate();
        autoUpdateCheckbox.onchange = async function (event) {
            await settings.setAutoUpdate(event.target.checked);
        };
    }

    const updateFrequencySecondsInput = document.getElementById("updateFrequencySecondsInput");
    if (updateFrequencySecondsInput !== null) {
        updateFrequencySecondsInput.value = await settings.getUpdateFrequencySeconds();
        updateFrequencySecondsInput.onchange = async function (event) {
            await settings.setUpdateFrequencySeconds(event.target.value);
        };
    }

    window.addEventListener("storage", async function () {
        if (autoUpdateCheckbox !== null) {
            autoUpdateCheckbox.checked = await settings.getAutoUpdate();
        }
        if (updateFrequencySecondsInput !== null) {
            updateFrequencySecondsInput.value = await settings.getUpdateFrequencySeconds();
        }
    });
});
