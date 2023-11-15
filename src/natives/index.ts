import { HandleHolder } from "./HandleHolder.js";
import nativeList from "../database/natives.js";
import { Callbacks, callbacks } from "../events/index.js";

const primitiveMapping = {
    integer: "I",
    real: "R",
    code: "C",
    boolean: "B",
    string: "S",
    nothing: "V",
} as Record<string, string>;

export interface Native<R, A extends Array<unknown>> {
    (...args: A): R;
    parametres: Array<string>;
    parametresName: Array<string>;
    nativeName: string;
    returnType: string;
}

interface NativeInternal<R, A extends Array<unknown>> extends Native<R, A> {
    binaryMode?: boolean;
    noNotify?: boolean;
}

const isDestructor = (nativeName: string) => {
    return nativeName.startsWith("Destroy") || nativeName.startsWith("Remove");
};

const isValueType = (value: unknown, type: string) => {
    if (type === "S") return true;

    if (type === "I") return Number.isInteger(Number(value));

    if (type === "R") return typeof value === "number" && !isNaN(value) && isFinite(value);

    if (type === "C") return typeof value === "function";

    return value instanceof HandleHolder;
};

export function getNativeByName<R, A extends Array<unknown>>(
    name: string,
    binaryMode?: boolean,
    noNotify?: boolean,
    noWrap?: boolean,
): Native<R, A> {
    const native = nativeList[name];
    if (!native) return null;

    const returnType = native.returnType;
    const parametres = native.args;

    const nativeMeta = {
        parametres: parametres.map((i) => primitiveMapping[i.type] || i.type),
        parametresName: parametres.map((i) => i.name),
        returnType: primitiveMapping[returnType] || returnType,
        binaryMode,
        noNotify,
        noWrap,
        nativeName: name,
    };

    const nativeFunc = (...args: A): R => {
        // Validate args

        for (let i = 0; i < args.length; ++i) {
            if (!isValueType(args[i], nativeMeta.parametres[i])) {
                throw new TypeError(
                    `Error in parameter type ${i + 1}. Exception ${nativeMeta.parametres[i]} got ${args[i]}`,
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

        const newHandle = new HandleHolder(returnType) as R;

        if (callbacks.onNewHandle && !noNotify) callbacks.onNewHandle(newHandle as HandleHolder, name);

        return newHandle;
    };

    return Object.assign(nativeFunc, nativeMeta);
}

export const getListNatives = () => {
    const result: Record<string, Native<unknown, Array<unknown>>> = {};

    Object.keys(nativeList).forEach((i) => {
        result[i] = getNativeByName(i);
    });

    return result;
};
