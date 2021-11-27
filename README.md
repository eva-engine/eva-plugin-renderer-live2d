# Eva.js Live2D Plugin

[Demo](https://fanmingfei.github.io/eva-plugin-renderer-live2d/)

Modify on the basis of [guansss/pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)

```bash
npm i eva-plugin-renderer-live2d
```

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
        data: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json'
      }
    }
  }
]);

const game = new Game({
  systems: [
    new RendererSystem({
      canvas: document.querySelector('#canvas'),
      width: 750,
      height: 1000,
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
    x: 0.3,
    y: 0.3
  }
});
const live2d = go.addComponent(new Live2D({
  resource: 'live2dName'
}))
live2d.on('loaded', () => {
  // 交互
  live2d.model.on('hit', hitAreas => {
    console.log(hitAreas)
    if (hitAreas.includes('head')) {
      console.log('play Anim')
      live2d.model.motion('Taphead');
    }
  });
})

game.scene.addChild(go);

```