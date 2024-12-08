const { readFileSync, writeFileSync } = require('fs');

module.exports = ({ shouldUpdateManifest, featureName }) => {
  if (!shouldUpdateManifest) {
    return;
  }
  const entryReplaceKey = '// NEW_PLOP_ENTRY';
  const manifest = readFileSync('features/manifest.ts').toString();
  if (manifest.includes(featureName)) {
    return 'feature entry already exists in manifest.ts';
  }
  writeFileSync(
    'features/manifest.ts',
    manifest.replace(entryReplaceKey, `'${featureName}': true,\n  ${entryReplaceKey}`),
  );
  return 'added feature entry in manifest.ts';
};
