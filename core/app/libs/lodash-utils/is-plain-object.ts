export default function isPlainObject(value: any): boolean {
  if (typeof value !== 'object' || value === null) return false;

  const proto = Object.getPrototypeOf(value);

  // Case for Object.create(null)
  if (proto === null) return true;

  let baseProto = proto;
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }

  return proto === baseProto;
}
