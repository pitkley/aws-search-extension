// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

/* global settings */

document.addEventListener("DOMContentLoaded", function () {
    const h1 = document.getElementsByTagName("h1")[0];
    h1.innerText += ` to v${browser.runtime.getManifest().version}`;
    const changesH2 = document.querySelector("h2#changes");
    if (changesH2 != null) {
        changesH2.innerText += ` in v${browser.runtime.getManifest().version}`;
    }

    const autoUpdateCheckbox = document.getElementById("autoUpdateCheckbox");
    if (autoUpdateCheckbox !== null) {
        autoUpdateCheckbox.checked = settings.autoUpdate;
        autoUpdateCheckbox.onchange = function (event) {
            settings.autoUpdate = event.target.checked;
        };
    }

    const updateFrequencySecondsInput = document.getElementById("updateFrequencySecondsInput");
    if (updateFrequencySecondsInput !== null) {
        updateFrequencySecondsInput.value = settings.updateFrequencySeconds;
        updateFrequencySecondsInput.onchange = function (event) {
            settings.updateFrequencySeconds = event.target.value;
        };
    }

    window.addEventListener("storage", function () {
        if (autoUpdateCheckbox !== null) {
            autoUpdateCheckbox.checked = settings.autoUpdate;
        }
        if (updateFrequencySecondsInput !== null) {
            updateFrequencySecondsInput.value = settings.updateFrequencySeconds;
        }
    });
});
