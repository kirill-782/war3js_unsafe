

export class HandleHolder<S extends string = string> {
  public readonly type: S;
  public payload: any;

  constructor(type: S) {
    this.type = type;
  }

  public equals(holder: HandleHolder<string> | null): boolean {
    return this === holder;
  }
}
