export { getListNatives, getNativeByName } from "./natives/index.js";
import { HandleHolder as hh } from "./natives/HandleHolder.js";
export { consoleLog } from "./console/index.js";

declare global {
  var HandleHolder: typeof hh;

  interface HandleHolder<S extends string> extends hh<S> {}
}

export const isDevMode = true;

export const HandleHolder = hh;

export {
  setToHandleHolder,
  setOnHandleDestroy,
  setOnNewHandle,
} from "./events/index.js";
