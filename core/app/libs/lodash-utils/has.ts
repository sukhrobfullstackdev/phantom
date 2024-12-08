// From: https://youmightnotneed.com/lodash#has

export default function get(obj, path) {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  return !!pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj);
}
