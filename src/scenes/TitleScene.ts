import * as PIXI from 'pixi.js'
import Scene from './Scene';
import BattleScene from './BattleScene';
import GameManager from '../GameManager';

export default class TitleScene extends Scene  {
  private text!: PIXI.Text;

  constructor() {
    super();

    this.text = new PIXI.Text("GAME START", new PIXI.TextStyle({
      fontSize: 48,
      fill: 0xffffff
    }));
    this.text.position.set(160, 568);
    this.text.interactive = true;
    this.text.on('pointerdown', () => this.onGameStartTapped());
    this.addChild(this.text);
  }

  private onGameStartTapped(): void {
    GameManager.loadScene(new BattleScene());
  }
}
