export const consoleLog = (kind: number, ...args: unknown[]) => {
    switch (kind) {
        case 0:
            console.log(...args);
            break;
        case 1:
            console.trace(...args);
            break;
        case 2:
            console.debug(...args);
            break;
        case 3:
            console.info(...args);
            break;
        case 4:
            console.error(...args);
            break;
        case 5:
            console.warn(...args);
            break;
    }
};
