/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "placeholder.com",      // Existing domain
      "imgs.search.brave.com", // Add this line to fix the error
    ],
  },
};

module.exports = nextConfig;
