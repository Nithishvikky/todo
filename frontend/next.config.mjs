const apiBaseUrl = (process.env.API_BASE_URL).replace(
  /\/$/,
  ""
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/todos",
        destination: `${apiBaseUrl}/todos`,
      },
      {
        source: "/todos/:path*",
        destination: `${apiBaseUrl}/todos/:path*`,
      },
    ];
  },
};

export default nextConfig;
