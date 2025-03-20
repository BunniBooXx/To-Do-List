module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "process": require.resolve("process"),
      };
      return webpackConfig;
    },
  },
};
