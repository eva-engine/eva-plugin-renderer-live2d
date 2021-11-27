import { ComponentChanged, decorators, OBSERVER_TYPE, resource, RESOURCE_TYPE } from '@eva/eva.js'
import { ContainerManager, Renderer, RendererManager, RendererSystem } from '@eva/plugin-renderer';
import Live2DComponent from './component';
// import live2d from './live2d'
// console.log(PIXI.Ticker)
import { Live2DModel } from './pixi-live2d-display/src';
console.log(Live2DModel, 123)

// @ts-ignore
RESOURCE_TYPE.LIVE2D = 'LIVE2D'


// @ts-ignore
resource.registerInstance(RESOURCE_TYPE.LIVE2D, async ({ data }) => {
  return await Live2DModel.from(data.url);
})


@decorators.componentObserver({
  Live2D: []
})
export default class Live2DSystem extends Renderer {
  readonly name = 'Live2D';
  renderSystem: RendererSystem;
  rendererManager: RendererManager;
  containerManager: ContainerManager;
  init() {
    this.renderSystem = this.game.getSystem(RendererSystem) as RendererSystem;
    this.renderSystem.rendererManager.register(this);
    Live2DModel.registerTicker(this.game.ticker)
  }
  componentChanged(changed: ComponentChanged) {
    if (changed.type === OBSERVER_TYPE.ADD) {
      this.add(changed)
    } else if (changed.type === OBSERVER_TYPE.REMOVE) {
      this.remove(changed)
    } else {
      this.change(changed)
    }
  }
  async add(changed: ComponentChanged) {
    // const model = await Live2DModel.from('https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json');
    const component = changed.component as Live2DComponent
    const { instance } = await resource.getResource(component.resource)
    // const model = await Live2DModel.from(data.json);
    component.model = instance
    this.renderSystem.containerManager.getContainer(changed.gameObject.id).addChildAt(instance, 0);
    component.emit('loaded')
  }
  remove(changed: ComponentChanged) {
    const component = changed.component as Live2DComponent
    const model = component.model
    this.renderSystem.containerManager.getContainer(changed.gameObject.id).removeChild(model);
    model.destroy({ children: true })
    component.model = null
  }
  change(changed) {
    this.remove(changed)
    this.add(changed)
  }
}