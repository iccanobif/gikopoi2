import type { JQueryStatic } from "jquery";

declare global {
    const $: JQueryStatic;
    const jQuery: JQueryStatic;
}

export {};
