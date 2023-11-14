export interface HandleHolder {
  [key: string]: unknown;
  [key: symbol]: unknown;
}

export class HandleHolder<S extends string = string> {
  public readonly type: S;
  public payload: unknown;

  constructor(type: S) {
    this.type = type;
  }

  public equals(holder: HandleHolder<string> | null): boolean {
    return this === holder;
  }
}
