import { Component } from '@eva/eva.js'
import { Live2DModel } from './pixi-live2d-display/src';

interface Live2DParams {
  resource: string;
}
export default class Live2DComponent extends Component<Live2DParams> {
  static componentName = 'Live2D';
  readonly name = 'Live2D';
  resource = ''
  model: Live2DModel
  init(params) {
    Object.assign(this, params)
  }
}