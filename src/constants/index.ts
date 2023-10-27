import { fakeHandleType } from "../index.js";
import { HandleHolder } from "../natives/HandleHolder.js";

let globalHandleTypes: Record<string, string> = {};

export const appendGlobalHandleTypes = (types: Record<string, string>) => {
  globalHandleTypes = { ...globalHandleTypes, ...types };
};

export const getGlobal = (name: string): HandleHolder<string> | undefined | null | string | number | boolean => {
  name = name.toLowerCase();

  if (name.match("oskey") || name.match("type") || name.match("event") || name.match("frame") || name.match("flag")) {
    return new HandleHolder(fakeHandleType);
  }

  if (name.startsWith("bj_")) return 0;

  if (globalHandleTypes[name]) return new HandleHolder(globalHandleTypes[name]);

  return undefined;
};
