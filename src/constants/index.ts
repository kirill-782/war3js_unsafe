import globals from "../database/globals.js";
import { fakeHandleType } from "../index.js";
import { HandleHolder } from "../natives/HandleHolder.js";

let globalHandleTypes: Record<symbol | number | string, string> = {};

export const appendGlobalHandleTypes = (types: Record<string, string>) => {
    globalHandleTypes = { ...globalHandleTypes, ...types };
};

export const getGlobal = <O extends Record<string, unknown>, K extends keyof O = keyof O>(name: K): O[K] => {
    if (typeof name !== "string") return;
    if (!(name in globals)) return;

    const globalType = (globals as any)[name] as string;

    if (globalType === "real" || globalType === "integer") return 0 as O[K];

    if (globalType === "string") return "" as O[K];

    if (globalType === "boolean") return false as O[K];

    return new HandleHolder(fakeHandleType) as O[K];
};
