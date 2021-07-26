module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/api?s=:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://nest.land',
        permanent: true,
      },
    ];
  },
};
