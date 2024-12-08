// Gets the toStringTag of value.
export default function baseGetTag(val: any): string {
  return Object.prototype.toString.call(val);
}
