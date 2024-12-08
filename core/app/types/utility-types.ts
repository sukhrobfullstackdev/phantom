export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export abstract class Tagged<T> {
  private readonly __tag__!: T;
}

export type Nominal<Type, Tag> = Type & Tagged<Tag>;
