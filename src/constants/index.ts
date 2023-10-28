import { fakeHandleType } from "../index.js";
import { HandleHolder } from "../natives/HandleHolder.js";

let globalHandleTypes: Record<symbol | number | string, string> = {};

export const appendGlobalHandleTypes = (types: Record<string, string>) => {
  globalHandleTypes = { ...globalHandleTypes, ...types };
};

export const getGlobal = <O extends Record<string, any>, K extends keyof O>(name: K): O[K] => {
  if (typeof name !== "string") return;

  const nameLower = name.toLowerCase();

  if (nameLower.match("oskey") || nameLower.match("type") || nameLower.match("event") || nameLower.match("frame") || nameLower.match("flag")) {
    return new HandleHolder(fakeHandleType) as O[K];
  }

  if (nameLower.startsWith("bj_")) return 0 as O[K];

  if (globalHandleTypes[name]) return new HandleHolder(globalHandleTypes[name]) as O[K];

  return undefined;
};
