export interface HandleHolder {
    [key: string]: unknown;
    [key: symbol]: unknown;
}

export class HandleHolder<T extends string = string, P extends unknown = unknown> {
    public readonly type: T;
    public payload: P;

    constructor(type: T) {
        this.type = type;
    }

    public equals(holder: HandleHolder<string> | null): boolean {
        return this === holder;
    }
}
