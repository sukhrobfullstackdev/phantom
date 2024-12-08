/**
 * Some third party libraries (i.e. ethers.js) automatically stringify the data, and
 * if that's the case, we need to parse it before signing to avoid throwing an error
 */
export const normalizeTypedData = data => {
  if (typeof data === 'string') {
    return JSON.parse(data);
  }
  return data;
};
