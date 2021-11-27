import { Texture } from 'pixi.js';

export function createTexture(url: string, options: { crossOrigin?: string } = {}): Promise<Texture> {

    // and in order to provide backward compatibility for older Pixi versions,
    // we have to manually implement this method
    // see https://github.com/pixijs/pixi.js/pull/6687/files

    // textureOptions.resourceOptions.autoLoad = false;

    const texture = Texture.from(url);

    //@ts-ignore
    if (texture.baseTexture.valid) {
        return Promise.resolve(texture);
    }

    const baseTexture = texture.baseTexture;

    // before Pixi v5.2.2, the Promise will not be rejected when loading has failed,
    // we have to manually handle the "error" event
    // see https://github.com/pixijs/pixi.js/pull/6374
    //@ts-ignore
    baseTexture._live2d_load = baseTexture._live2d_load  ?? new Promise<Texture>((resolve, reject) => {
        const errorHandler = (event: ErrorEvent) => {
            (baseTexture.source as HTMLImageElement).removeEventListener('error', errorHandler);

            // convert the ErrorEvent to an Error
            const err = new Error('Texture loading error');
            (err as any).event = event;

            reject(err);
        };

        (baseTexture.source as HTMLImageElement).addEventListener('error', errorHandler);

        baseTexture.on('loaded', () => resolve(texture))
        //@ts-ignore
        baseTexture.on('error', () => errorHandler())
    });
    //@ts-ignore
    return baseTexture._live2d_load;
}
