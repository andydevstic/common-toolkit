const versionPlaceholder = '_version';

// Helper functions for versioned cache keys
export const getVersionedCacheKey = (key: string, version: number) => {
  if (key.includes(versionPlaceholder)) {
    return key.replace(versionPlaceholder, version.toString());
  }

  return `${key}:version:${version}`;
};

export const getVersionCacheKeyForKey = (key: string) => {
  if (key.includes(versionPlaceholder)) {
    const indexOfPlaceholder = key.indexOf(versionPlaceholder);

    return key.substring(0, indexOfPlaceholder);
  }

  return `${key}:version`;
};
