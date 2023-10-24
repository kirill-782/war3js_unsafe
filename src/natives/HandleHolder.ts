export class HandleHolder<S extends string> {
  public readonly type: S;
  public payload: any;

  constructor(type: S) {
    this.type = type;
  }

  public equals(holder: HandleHolder<string>): boolean {
    return this === holder;
  }
}
