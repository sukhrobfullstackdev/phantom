import { CamelCase } from 'type-fest';

export type CamelCaseObjectDeep<ObjectType> = ObjectType extends object
  ? {
      [Key in keyof ObjectType as CamelCase<Key>]: ObjectType[Key] extends object
        ? ObjectType[Key] extends Array<infer NestedArrayType>
          ? Array<CamelCaseObjectDeep<NestedArrayType>>
          : CamelCaseObjectDeep<ObjectType[Key]>
        : ObjectType[Key];
    }
  : ObjectType;

/**
 * Returns a partial object with only the keys that pass the predicate
 * @param {Object} object input object
 * @param {Function} [predicate] predicate function
 * @returns partial object
 */

export function pickBy<T>(object: T, predicate?: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
  const result: Partial<T> = {};
  const condition = predicate ?? ((value: T[keyof T]) => !!value);
  for (const key in object) {
    if (condition(object[key], key)) {
      result[key] = object[key];
    }
  }
  return result;
}

export const camelizeSnakeKeys = <T>(objToConvert: T): CamelCaseObjectDeep<T> => {
  const converted: { [key: string]: any } = {};

  if (typeof objToConvert !== 'object' || !objToConvert) {
    return objToConvert as any;
  }

  Object.keys(objToConvert).forEach((k: string) => {
    const key: keyof T = k as keyof T;
    const newKey = k.replace(/(_\w)/g, w => w[1].toUpperCase());

    converted[newKey] = objToConvert[key];

    if (Array.isArray(objToConvert[key])) {
      converted[newKey] = (objToConvert[key] as any).map(camelizeSnakeKeys);
    } else if (typeof objToConvert[key] !== 'object') {
      converted[newKey] = objToConvert[key];
    } else {
      converted[newKey] = camelizeSnakeKeys(objToConvert[key]);
    }
  });

  return converted as CamelCaseObjectDeep<T>;
};
