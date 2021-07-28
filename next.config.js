module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
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
