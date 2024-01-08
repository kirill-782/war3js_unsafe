import globals from "./database/globals.js";
import docKeys from "./database/docKeys.js";

export const fakeHandleType = "_enum";

export const isDevMode = true;

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

export { getListNatives, getNativeByName } from "./natives/index.js";
export { HandleHolder } from "./natives/HandleHolder.js";
export { consoleLog } from "./console/index.js";
