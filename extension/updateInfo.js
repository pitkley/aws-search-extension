// Copyright Pit Kleyersburg <pitkley@googlemail.com>
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified or distributed
// except according to those terms.

const versionRegex = /^v?(?<major>[0-9]+)\.(?<minor>[0-9]+)\.(?<patch>[0-9]+)/;

const semver = (version) => {
    const [, major, minor, patch] = versionRegex.exec(version);

    return {
        major: Number.parseInt(major),
        minor: Number.parseInt(minor),
        patch: Number.parseInt(patch),
    };
}

const extensionUpdated = async ({ currentVersion, previousVersion }) => {
    if (currentVersion == previousVersion)
        return;

    const {
        major: currentMajor,
        minor: currentMinor,
        patch: currentPatch,
    } = semver(currentVersion);
    const {
        major: previousMajor,
        minor: previousMinor,
        patch: previousPatch,
    } = semver(previousVersion);

    // Update from 0.3.x -> notify about keyword change
    if (previousMajor === 0 && previousMinor === 3 &&
        (currentMajor > previousMajor || currentMinor > previousMinor)) {
        await browser.tabs.create({
            url: browser.extension.getURL("popup/updates/post-0.3.x.html"),
        });
        return;
    }
    // Update from 0.4.x -> notify about automatic index updates, SAM-support and full release
    if (previousMajor === 0 && previousMinor === 4 &&
        (currentMajor > previousMajor || currentMinor > previousMinor)) {
        await browser.tabs.create({
            url: browser.extension.getURL("popup/updates/post-0.4.x.html"),
        });
        return;
    }
};

const installListener = async ({ previousVersion, reason }) => {
    if (reason !== "update" || previousVersion === undefined)
        return;

    const currentVersion = browser.runtime.getManifest().version;
    await extensionUpdated({
        currentVersion,
        previousVersion,
    });
};

browser.runtime.onInstalled.addListener(installListener)
