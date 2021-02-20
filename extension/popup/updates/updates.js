// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

document.addEventListener("DOMContentLoaded", function () {
    const h1 = document.getElementsByTagName("h1")[0];
    h1.innerText += ` to v${browser.runtime.getManifest().version}`;
});
