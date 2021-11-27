import { Game, GameObject, resource, RESOURCE_TYPE } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { Img, ImgSystem } from '@eva/plugin-renderer-img';
import { Live2DSystem, Live2D } from '../src'

resource.addResource([
  {
    name: 'imageName',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url:
          'https://gw.alicdn.com/tfs/TB1DNzoOvb2gK0jSZK9XXaEgFXa-658-1152.webp',
      },
    },
    preload: true,
  },
  {
    name: 'heart',
    type: RESOURCE_TYPE.IMAGE,
    src: {
      image: {
        type: 'png',
        url: '//gw.alicdn.com/bao/uploaded/TB1lVHuaET1gK0jSZFhXXaAtVXa-200-200.png',
      }
    },
    preload: false,
  },
  {
    name: 'live2dName',
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
    new TextSystem(),
    new ImgSystem(),
    new Live2DSystem(),
  ],
});

// game.scene.transform.size = {
//   width: 1000,
//   height: 2000
// }

const back = new GameObject('', {
  position: {x:200,y:500}
})
back.addComponent(new Text({text: '在后面渲染 ', style:{fill:0xff0000}}))
game.scene.addChild(back)

const img1 = new GameObject('', {
  size: {
    width: 500,
    height: 500,
  }
})
img1.addComponent(new Img({resource: 'imageName'}))
game.scene.addChild(img1)

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
  // origin: {
  //   x: 0.5,
  //   y: 0.5
  // },
  // anchor: {
  //   x: 0.5,
  //   y: 0.5
  // }
});
go.addComponent(new Live2D({
  resource: 'live2dName'
}))


game.scene.addChild(go);


const front = new GameObject('', {
  position: {x:400,y:500}
})
front.addComponent(new Text({text: '在前面渲染', style:{fill:0x382199}}))

game.scene.addChild(front)


const img2 = new GameObject('', {
  size: {
    width: 300,
    height: 300,
  },
  position: {
    x: 500,
    y: 500
  }
})
img2.addComponent(new Img({resource: 'heart'}))
game.scene.addChild(img2)
