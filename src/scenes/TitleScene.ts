import GameManager from 'GameManager';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';

export default class TitleScene extends Scene  {
  public onGameStartTapped(): void {
    GameManager.loadScene(new BattleScene());
  }
}
