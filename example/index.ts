import { Game, GameObject } from '@eva/eva.js';
import { RendererSystem } from '@eva/plugin-renderer';
import { Text, TextSystem } from '@eva/plugin-renderer-text';
import { DemoSystem } from '../src'

const game = new Game({
  systems: [
    new RendererSystem({
      canvas: document.querySelector('#canvas'),
      width: 800,
      height: 600,
    }),
    new TextSystem(),
    new DemoSystem(),
  ],
});

game.scene.transform.size = {
  width: 800,
  height: 600
}

const text = new GameObject("text", {
  position: {
    x: 0,
    y: 0
  },
  origin: {
    x: 0.5,
    y: 0.5
  },
  anchor: {
    x: 0.5,
    y: 0.5
  }
});

text.addComponent(new Text({
  text: "欢迎使用EVA互动游戏开发体系！",
  style: {
    fontFamily: "Arial",
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "bold",
    fill: ["#b35d9e", "#84c35f", "#ebe44f"], // gradient
    fillGradientType: 1,
    fillGradientStops: [0.1, 0.4],
    stroke: "#4a1850",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 400,
    breakWords: true
  }
}));

game.scene.addChild(text);
