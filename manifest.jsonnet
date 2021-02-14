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
  description='A search-extension for quick, fuzzy-search results for AWS developers!',
)
             .addIcons(icons())
             .addPermissions(['storage', 'unlimitedStorage'])
             .addBackgroundScripts(['vendored/webextension-polyfill/browser-polyfill.min.js'])
             .addBackgroundScripts(['settings.js', 'utils.js'])
             .addBackgroundScripts(['vendored/fuzzy-search/FuzzySearch.js'])
             .addBackgroundScripts(utils.js_files('command', ['help', 'update']))
             .addBackgroundScripts(utils.js_files('search', ['lib']))
             .addBackgroundScripts(utils.js_files('index', ['api', 'cfn', 'cli']))
             .addBackgroundScripts(utils.js_files('search', ['api', 'cfn', 'cli']))
             .addBackgroundScripts(['main.js']);

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
else
  json
