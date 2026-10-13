module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{js,html,ttf,ico,json,png,svg,css}'],
  globIgnores: ['**/manifest.json', '**/sw.js'],
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [/^utm_/, /^fbclid/],
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/^\/_expo\//],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
};