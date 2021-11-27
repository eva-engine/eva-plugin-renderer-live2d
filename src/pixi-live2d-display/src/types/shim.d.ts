/**
 * PIXI shims
 */

declare module '@pixi/core' {
    export {
        Renderer, Texture, BaseTexture, BaseRenderTexture, RenderTexture, Framebuffer, GLFramebuffer,
    } from 'pixi.js';
}

declare module '@pixi/settings' {
    export { settings } from 'pixi.js';
}

declare module '@pixi/utils' {
    import { utils } from 'pixi.js';
    export import EventEmitter = utils.EventEmitter;
    export import url = utils.url;
}

declare module '@pixi/app' {
    export { Application } from 'pixi.js';
}

declare module '@pixi/filter-*' {
    import { filters } from 'pixi.js';
    export import AlphaFilter = filters.AlphaFilter;
}

declare module '@pixi/ticker' {
    export { Ticker } from 'pixi.js';
}

declare module '@pixi/display' {
    export { DisplayObject, Container } from 'pixi.js';
}

declare module '@pixi/graphics' {
    export { Graphics } from 'pixi.js';
}

declare module '@pixi/text' {
    export { Text, TextStyle } from 'pixi.js';
}

declare module '@pixi/interaction' {
    export { InteractionEvent, InteractionManager } from 'pixi.js';
}

declare module '@pixi/math' {
    export { Matrix, Point, ObservablePoint, Rectangle, Bounds, Transform } from 'pixi.js';
}
