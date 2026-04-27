const siteUrl = 'https://app.nado.xyz';

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  additionalPaths: async (config) => {
    const transformedPaths = [];
    for (const path of ['/spot', '/perpetuals']) {
      transformedPaths.push(await config.transform(config, path));
    }

    return transformedPaths;
  },
};

export default config;
