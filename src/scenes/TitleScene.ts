import GameManager from 'managers/GameManager';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';

export default class TitleScene extends Scene  {
  public onGameStartTapped(): void {
    GameManager.loadScene(new BattleScene());
  }

  protected onResourceLoaded(): void {
    this.addChild(this.uiGraphContainer);
  }
}
