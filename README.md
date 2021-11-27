# Eva.js Live2D Plugin


Modify on the basis of (guansss/pixi-live2d-display)[https://github.com/guansss/pixi-live2d-display]

```js
import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Live2DSystem, Live2D } from 'eva-plugin-renderer-live2d'

resource.addResource([
  {
    name: 'live2dName',
    // @ts-ignore
    type: RESOURCE_TYPE.LIVE2D,
    src: {
      url: {
        type: 'data',
        data: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/galgame%20live2d/Fox%20Hime%20Zero/mori_suit/mori_suit.model3.json'
      }
    }
  }
]);

const game = new Game({
  systems: [
    new RendererSystem({
      canvas: document.querySelector('#canvas'),
      width: 1000,
      height: 2000,
    }),
    new Live2DSystem(),
  ],
});

const go = new GameObject("aaa", {
  size: {
    width: 0,
    height: 0
  },
  position: {
    x: 0,
    y: 0
  },
  scale: {
    x: 0.5,
    y: 0.5
  }
});
go.addComponent(new Live2D({
  resource: 'live2dName'
}))
game.scene.addChild(go);

```