/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: { 
        nextScriptWorkers: true,
     },
    webpack: (config, { isServer }) => {
        // plugin config, etc
        config.resolve.fallback = { fs: false };
        return config;
    }
}

module.exports = nextConfig
