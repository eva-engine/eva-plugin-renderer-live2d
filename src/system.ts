import { System } from '@eva/eva.js'

export default class DemoSystem extends System {
  readonly name = 'Demo';

  init() {
    console.log('demo system has been added to renderer system.')
  }
}