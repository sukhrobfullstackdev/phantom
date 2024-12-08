export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends Readonly<infer U>[]
    ? Readonly<DeepPartial<U>>[]
    : DeepPartial<T[P]>;
};

export type KnownKeys<T> = { [K in keyof T]: string extends K ? never : number extends K ? never : K } extends {
  [_ in keyof T]: infer U;
}
  ? U extends keyof T
    ? U
    : never
  : never;

export type ValuesOf<T> = T extends ReadonlyArray<any> ? T[number] : T[keyof T];

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type Maybe<T> = T | false | null | undefined;
export type Definitely<T> = Exclude<T, false | null | undefined>;

type Impossible<K extends keyof any> = { [P in K]: never };
export type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;
