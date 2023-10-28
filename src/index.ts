export { getListNatives, getNativeByName } from "./natives/index.js";
import { HandleHolder as hh } from "./natives/HandleHolder.js";
export { consoleLog } from "./console/index.js";

declare global {
  var HandleHolder: typeof hh;

  interface HandleHolder<S extends string = string> extends hh {
    get type(): S;
    payload: any;
    equals: (handle: HandleHolder<string> | null) => boolean;
  }
}

globalThis.HandleHolder = hh;

export const fakeHandleType = "_enum";

export const isDevMode = true;

export const HandleHolder = hh;

export const readMpqFile = (path: string): null | Uint8Array => {
  return Uint8Array.of();
};

export { getGlobal, appendGlobalHandleTypes } from "./constants/index.js";
export { setToHandleHolder, setOnHandleDestroy, setOnNewHandle } from "./events/index.js";
