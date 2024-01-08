import { HandleHolder } from "../natives/HandleHolder.js";

type ToHandleHolderFunction = (arg: unknown) => unknown;
type OnNewHandleFunction = (handle: HandleHolder<string>, creatorNativeName: string) => unknown;

type OnHandleDestroyFunction = (handle: HandleHolder<string>) => unknown;

export interface Callbacks {
    toHandleHolder?: ToHandleHolderFunction;
    onNewHandle?: OnNewHandleFunction;
    onHandleDestroy?: OnHandleDestroyFunction;
}

export const callbacks: Callbacks = {};

export const setToHandleHolder = (callback: ToHandleHolderFunction) => {
    callbacks.toHandleHolder = callback;
};

export const setOnNewHandle = (callback: OnNewHandleFunction) => {
    callbacks.onNewHandle = callback;
};

export const setOnHandleDestroy = (callback: OnHandleDestroyFunction) => {
    callbacks.onHandleDestroy = callback;
};
