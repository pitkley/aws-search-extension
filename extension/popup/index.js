// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

document.addEventListener("DOMContentLoaded", function () {
    const autoUpdateCheckbox = document.getElementById("autoUpdateCheckbox");
    autoUpdateCheckbox.checked = settings.autoUpdate;
    autoUpdateCheckbox.onchange = function (event) {
        settings.autoUpdate = event.target.checked;
    };

    const updateFrequencySecondsInput = document.getElementById("updateFrequencySecondsInput");
    updateFrequencySecondsInput.value = settings.updateFrequencySeconds;
    updateFrequencySecondsInput.onchange = function (event) {
        settings.updateFrequencySeconds = event.target.value;
    };

    const extensionVersion = `v${browser.runtime.getManifest().version}`;
    for (const element of document.getElementsByClassName("version")) {
        element.innerText = extensionVersion;
    }
});
