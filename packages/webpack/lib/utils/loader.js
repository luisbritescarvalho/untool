import { getOptions } from 'loader-utils';

export default function() {
  this.cacheable();
  const { target, config } = getOptions(this);
  const mixins = config
    .getMixins(target)
    .map(mixin => `require('${mixin}').default`);
  if (target === 'server') {
    return `
      var path = require('path');
      var root = require('find-up').sync('package.json');
      var expand = path.join.bind(path, root);
      module.exports = {
        getMixins() { return [${mixins.join(',')}] },
        getConfig() { return ${JSON.stringify(config).replace(
          new RegExp(`"${config.rootDir}([^"]*)"`, 'g'),
          'expand(".$1")'
        )} },
      };
    `;
  } else {
    return `
      module.exports = {
        getMixins() { return [${mixins.join(',')}] },
        getConfig() { return ${JSON.stringify(
          Object.keys(config).reduce(
            (result, key) =>
              key.startsWith('_') ? result : { ...result, [key]: config[key] },
            {}
          )
        ).replace(new RegExp(`"${config.rootDir}([^"]*)"`, 'g'), '".$1"')} },
      };
    `;
  }
}