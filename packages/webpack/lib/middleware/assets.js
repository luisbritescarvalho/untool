const { join, extname } = require('path');

const getAssetData = (locals = {}, config) => {
  if (locals.webpackStats) {
    const { assets, assetsByChunkName } = locals.webpackStats.toJson();
    return { assets, assetsByChunkName };
  }
  return require(join(config.buildDir, config.assetFile));
};

module.exports = (config, assetData) => (req, res, next) => {
  assetData = assetData && assetData.assets ? assetData : null;
  const { assetsByType, assetsByChunkName } = (res.locals = {
    ...res.locals,
    ...(assetData || getAssetData(res.locals, config)),
    assetsByType: config.assetTypes.reduce(
      (result, extension) => ({ ...result, [extension]: [] }),
      {}
    ),
  });
  config.assetNames.forEach(chunkName => {
    const assets = Array.isArray(assetsByChunkName[chunkName])
      ? assetsByChunkName[chunkName]
      : [assetsByChunkName[chunkName]];
    config.assetTypes.forEach(extension => {
      const asset = assets.find(
        asset => asset && extname(asset) === `.${extension}`
      );
      if (asset) {
        assetsByType[extension].push(asset);
      }
    });
  });
  next();
};
