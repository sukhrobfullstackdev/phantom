export default function isArguments(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Arguments]';
}
