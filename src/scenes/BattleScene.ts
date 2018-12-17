import * as PIXI from 'pixi.js'
import Scene from './Scene';

export default class BattleScene extends Scene {
  constructor() {
    super();

    const text = new PIXI.Text("BattleScene", new PIXI.TextStyle({
      fontSize: 48,
      fill: 0xffffff
    }));
    text.position.set(160, 568);
    this.addChild(text);

    //this.text.on('tap', this.onGameStartTapped);
  }
}
