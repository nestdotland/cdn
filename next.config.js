module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/deno-import-intellisense.json',
      },
      {
        source: '/.well-known/deno-import-intellisense.json',
        destination: '/deno-import-intellisense.json',
      },
      {
        source: '/:path*',
        destination: '/api/cdn?s=:path*',
      },
    ];
  },
};
