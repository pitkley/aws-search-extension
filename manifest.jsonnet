local manifest = import 'core/manifest.libsonnet';
local utils = import 'core/utils.libsonnet';
local icons() = {
  [size]: 'logo.png'
  for size in ['16', '48', '128']
};

local json = manifest.new(
  name='AWS Search Extension',
  version='0.1.0',
  keyword='aws',
  description='A search-extension for quick, fuzzy-search results for AWS developers!',
)
             .addIcons(icons())
             .addBackgroundScripts(['utils.js'])
             .addBackgroundScripts(['vendored/fuzzy-search/FuzzySearch.js'])
             .addBackgroundScripts(utils.js_files('command', ['help']))
             .addBackgroundScripts(utils.js_files('index', ['api', 'cfn']))
             .addBackgroundScripts(utils.js_files('search', ['cfn']))
             .addBackgroundScripts(['main.js']);

json
