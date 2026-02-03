import { defineConfigFactory, type PartialEggConfig } from 'egg';

export default defineConfigFactory((appInfo) => {
  const config = {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_{{keys}}',

    // add your egg config in here
    middleware: [] as string[],

    // change multipart mode to file
    // @see https://github.com/eggjs/multipart/blob/master/src/config/config.default.ts#L104
    multipart: {
      mode: 'file' as const,
      fileSize: Infinity, // 无文件大小限制
    },
  } as PartialEggConfig;

  // add your special config in here
  // Usage: `app.config.bizConfig.sourceUrl`
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // assets module configuration
  const assetsConfig = {
    uploadDir: appInfo.baseDir + '/uploads',
    maxFileSize: Infinity, // 无文件大小限制
    thumbnailSize: 512, // 缩略图尺寸 (512-1024 之间比较合理)
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    bizConfig,
    assets: assetsConfig,
  };
});
