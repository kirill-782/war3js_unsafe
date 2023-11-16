export { getListNatives, getNativeByName } from "./natives/index.js";
import { HandleHolder as hh } from "./natives/HandleHolder.js";
export { consoleLog } from "./console/index.js";

import globals from "./database/globals.js";
import docKeys from "./database/docKeys.js";

declare global {
    var HandleHolder: typeof hh;

    interface HandleHolder<T extends string = string, P = unknown> extends hh<T, P> {
        [key: string]: unknown;
        [key: symbol]: unknown;
    }
}

globalThis.HandleHolder = hh;

export const fakeHandleType = "_enum";

export const isDevMode = true;

export const HandleHolder = hh;

export const readMpqFile = (path: string): null | Uint8Array => {
    return Uint8Array.of();
};

export const __getDatabaseGlobalType = (globalName: string): string => {
    return (globals as any)[globalName];
};

export const __getDatabaseDocKey = (id: string): string => {
    return (docKeys as any)[id];
};

export const getGlobalsKeys = (): string[] => {
    return Object.keys(globals);
};

export { getGlobal, appendGlobalHandleTypes } from "./constants/index.js";
export { setToHandleHolder, setOnHandleDestroy, setOnNewHandle } from "./events/index.js";
