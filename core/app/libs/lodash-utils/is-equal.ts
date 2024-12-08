export default function isEqual(value: any, other: any): boolean {
  if (value === other) return true;

  if (typeof value !== 'object' || value === null || typeof other !== 'object' || other === null) {
    return false;
  }

  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) return false;
    for (let i = 0; i < value.length; i++) {
      if (!isEqual(value[i], other[i])) return false;
    }
    return true;
  }

  const valueKeys = Object.keys(value);
  const otherKeys = Object.keys(other);

  if (valueKeys.length !== otherKeys.length) return false;

  for (const key of valueKeys) {
    if (!otherKeys.includes(key)) return false;
    if (!isEqual(value[key], other[key])) return false;
  }

  return true;
}
