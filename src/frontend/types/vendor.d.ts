declare module "jquery-ui-touch-punch";
declare module "jquery-ui/dist/jquery-ui.js";

interface JQueryUiSliderOptions {
    orientation?: "horizontal" | "vertical"
    range?: boolean | "min" | "max"
    min?: number
    max?: number
    step?: number
    value?: number
    slide?: (event: Event, ui: { value: number }) => void
}

interface JQueryUiResizableOptions {
    aspectRatio?: boolean
    handles?: string
    resize?: (event: Event, ui: unknown) => void
}

interface JQueryUiDraggableOptions {
    containment?: string | Element
}

interface JQuery<TElement = HTMLElement> {
    slider(options: JQueryUiSliderOptions): this
    resizable(options?: JQueryUiResizableOptions): this
    draggable(options?: JQueryUiDraggableOptions): this
    draggable(methodName: "destroy"): this
}

interface AnimaleseOutput {
    dataURI: string
}

interface AnimaleseInstance {
    Animalese(script: string, shorten: boolean, pitch: number): AnimaleseOutput
}

interface ChessboardInstance {
    position(position: string): void
}

interface ChessboardConfig {
    pieceTheme: string
    position: string
    orientation: "white" | "black"
    draggable: boolean
    onDragStart?: (...args: unknown[]) => boolean | void
    onDrop?: (source: string, target: string) => void
    onSnapEnd?: () => void
}

declare global {
    interface HTMLInputElement {
        refresh?: () => void
    }

    interface Window {
        $: JQueryStatic
        jQuery: JQueryStatic
        Animalese: new (lettersFile: string, onload: () => void) => AnimaleseInstance
        Chessboard: (container: string | HTMLElement | null, config: ChessboardConfig) => ChessboardInstance | null
        ChessBoard: Window["Chessboard"]
        webkitAudioContext?: typeof AudioContext
    }
}

export {}
