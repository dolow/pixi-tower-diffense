import * as PIXI from 'pixi.js'
import Scene from './Scene';

export default class TitleScene extends Scene  {
  private text!: PIXI.Text;
  private count: number = 0;

  constructor() {
    super();
    this.text = new PIXI.Text("new text", new PIXI.TextStyle({
      fontSize: 48,
      fill: 0xffffff
    }));
    this.text.position.set(160, 568);
    this.addChild(this.text);
  }

  public update(_: number): void {
    this.text.text = (this.count++).toString();
  }
}
