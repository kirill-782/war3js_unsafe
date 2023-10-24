type ToHandleHolderFunction = (arg: any) => any;
type OnNewHandleFunction = (
  handle: HandleHolder<string>,
  creatorNativeName: string
) => any;

type OnHandleDestroyFunction = (handle: HandleHolder<string>) => any;

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
