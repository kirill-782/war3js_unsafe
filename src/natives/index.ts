import { HandleHolder } from "./HandleHolder.js";
import { nativeList } from "./nativeList.js";
import { Callbacks, callbacks } from "../events/index.js";

const primitiveMapping = {
  integer: "I",
  real: "R",
  code: "C",
  boolean: "B",
  string: "S",
  nothing: "V"
} as Record<string, string>;

export interface Native<R, A extends Array<any>> {
  (...args: A): R;
  parametres: Array<string>;
  returnType: string;
}

interface NativeInternal<R, A extends Array<any>> extends Native<R, A> {
  binaryMode?: boolean;
  noNotify?: boolean;
}

const isDestructor = (nativeName: string) => {
  return nativeName.startsWith("Destroy") || nativeName.startsWith("Remove");
};

const isValueType = (value: any, type: string) => {
  if (type === "S") return true;

  if (type === "I") return Number.isInteger(Number(value));

  if (type === "R") return !isNaN(value) && isFinite(value);

  if (type === "C") return typeof value === "function";

  return value instanceof HandleHolder;
};

export function getNativeByName<R, A extends Array<any>>(
  name: string,
  binaryMode?: boolean,
  noNotify?: boolean
): Native<R, A> {
  const native = nativeList[name];
  if (!native) return null;

  const argsAndReturn = native.split(" ");

  const returnType = argsAndReturn[argsAndReturn.length - 1];
  const parametres = argsAndReturn.slice(0, -1);

  const nativeMeta = {
    parametres: parametres.map((i) => primitiveMapping[i] || i),
    returnType: primitiveMapping[returnType] || returnType,
    binaryMode,
    noNotify,
  };

  const nativeFunc = (...args: A): R => {
    // Validate args

    for (let i = 0; i < args.length; ++i) {
      if (!isValueType(args[i], nativeMeta.parametres[i])) {
        throw new TypeError(
          `Error in parameter type ${i + 1}. Exception ${
            nativeMeta.parametres[i]
          } got ${args[i]}`
        );
      }
    }

    if (
      returnType === "V" &&
      parametres.length === 1 &&
      args[0] instanceof HandleHolder &&
      isDestructor(name) &&
      callbacks.onHandleDestroy
    ) {
      callbacks.onHandleDestroy(args[0]);
    }

    if (nativeMeta.returnType === "I") return 0 as R;
    if (nativeMeta.returnType === "R") return 0.1 as R;
    if (nativeMeta.returnType === "C") return (() => {}) as R;
    if (nativeMeta.returnType === "B") return binaryMode as R;
    if (nativeMeta.returnType === "S") return "" as R;
    if (nativeMeta.returnType === "V") return;

    return new HandleHolder(returnType) as R;
  };

  return Object.assign(nativeFunc, nativeMeta);
}

export const getListNatives = () => {
  const result: Record<string, Native<any, Array<any>>> = {};

  Object.keys(nativeList).forEach((i) => {
    result[i] = getNativeByName(i);
  });

  return result;
};
