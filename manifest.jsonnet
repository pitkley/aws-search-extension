local manifest = import 'core/manifest.libsonnet';
local utils = import 'core/utils.libsonnet';
local icons() = {
  [size]: 'logo.png'
  for size in ['16', '48', '128']
};

local packageJsonStr = importstr 'package.json';
local packageJson = std.parseJson(packageJsonStr);

local fragmentVersionSuffix = importstr 'hack/jsonnet-fragments/version-suffix';
local fragmentBrowserSpecificSettingsGeckoId = importstr 'hack/jsonnet-fragments/browserspecificsettings-gecko-id';

local json = manifest.new(
  name='AWS Search Extension',
  version='%s%s' % [packageJson.version, fragmentVersionSuffix],
  keyword='ase',
  description=packageJson.description,
)
             .addIcons(icons())
             .addPermissions(['storage', 'unlimitedStorage'])
             .addBackgroundScripts(['vendored/webextension-polyfill/browser-polyfill.min.js'])
             .addBackgroundScripts(['settings.js', 'utils.js', 'updateInfo.js'])
             .addBackgroundScripts(['vendored/fuzzy-search/FuzzySearch.js'])
             .addBackgroundScripts(utils.js_files('command', ['help', 'update']))
             .addBackgroundScripts(utils.js_files('search', ['lib']))
             .addBackgroundScripts(utils.js_files('index', ['api', 'cfn', 'cli']))
             .addBackgroundScripts(utils.js_files('search', ['api', 'cfn', 'cli']))
             .addBackgroundScripts(['main.js'])
             .addBrowserAction('popup/index.html', packageJson.description) {
               # NOTE: we overwrite the permissions here because `core/manifest.libsonnet` defines the `tab` permission
               #       by default, which is not necessary for the funcionality of the extension. We can remove this
               #       workaround once core does not prepopulate this.
               permissions: ['storage', 'unlimitedStorage'],
             };

local browser = std.extVar('browser');
if browser == 'firefox' then
  if fragmentBrowserSpecificSettingsGeckoId != "" then
    json {
      browser_specific_settings: {
        gecko: {
          id: fragmentBrowserSpecificSettingsGeckoId
        }
      }
    }
  else json
else if browser == 'chrome' then
  json {
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqcanHEBpM8ZQG+zY2Xy+nyu5XiRjqSrFH+rutHxeyEqswA4KYNH9FFEgjy3On2+W2udY0CJzaBMgC6nPH2nFzdVGfc2CK+0wgLjYAkQjnzTd/0jFriZrSH5S8fXJOFoEZRz3wbHX3rfOI4FpbtjCMCwDQITBgqCcF1BzFRHBDQdwv2WviJUHbuPkVO7QaeTJ4tWi0E5+rVHPhkHpf/zerAn275xqbR/jY3rGrlP6OTOApvjd0pSKXoznuoSKjp6Ma0O8o1aQgZD9JHRHKr7OHmqZKx7MZImHOw0JOopytkR5dfsuM1pU1xYUuHNUgjLDfeeX2N2Z0cBZlC8bt8Wv+QIDAQAB'
  }
else if browser == 'edge' then
  json {
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvtgDNu7iNBinC4GEgTqfOlJodb2AS32WS7yHaRuzZDFglG/7ZGhsN3O8hWLTLI+NuCCRgTz4PACsN58A2GcNjbE3P3ei2rCaTiIibwRCz9WLBHATtntUe0DIFPpl+0Gax5r/hy10mhiiD1/RcqHUMk9qEl3URqgRbIz8bXoGSP4FeeFtvGjm9JvuteU8UslEfhM6atuZF82JouIkYmB2Ag7Ey3yXgUlxAkJLhjHXo0bLurwsDdol5xLHzfgPMzWXdUt/oD+jz79kb8A/VECzjaDbYpjDrI064m55xWHZkayo23HylLEZgbumkS0ZUzoMkCikPSEkDrWyyPfdlWRG4QIDAQAB'
  }
else
  json
