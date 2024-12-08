export default function omit(obj: Record<string, any>, props: string[]): Record<string, any> {
  const newObj: Record<string, any> = { ...obj };
  props.forEach(prop => delete newObj[prop]);
  return newObj;
}
