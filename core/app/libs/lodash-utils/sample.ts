export default function sample(value) {
  const len = value == null ? 0 : value.length;
  return len ? value[Math.floor(Math.random() * len)] : undefined;
}
