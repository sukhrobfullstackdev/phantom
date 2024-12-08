import extend from 'just-extend';

export default function merge(target, ...sources) {
  return extend(true, target as object, ...(sources as object[]));
}
