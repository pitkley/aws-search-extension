local manifest = import 'core/manifest.libsonnet';
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
             .addBackgroundScripts(['main.js']);

json
