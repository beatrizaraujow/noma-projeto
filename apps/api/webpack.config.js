module.exports = (options) => {
  const originalExternals = options.externals;

  const patchExternal = (ext) => {
    if (typeof ext !== 'function') return ext;
    return (ctx, callback) => {
      if (/^@nexora\//.test(ctx.request)) {
        return callback(); // bundle workspace packages inline
      }
      return ext(ctx, callback);
    };
  };

  return {
    ...options,
    externals: Array.isArray(originalExternals)
      ? originalExternals.map(patchExternal)
      : patchExternal(originalExternals),
  };
};
