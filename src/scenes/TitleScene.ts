import GameManager from 'managers/GameManager';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {

  public onGameStartTappedDown(): void {
    this.uiGraph.title_off.alpha = 0;
  }
  /**
   * ゲーム開始ボタンが押下されたときのコールバック
   */
  public onGameStartTappedUp(): void {
    this.uiGraph.title_off.alpha = 1;
    GameManager.loadScene(new BattleScene());
  }
}
