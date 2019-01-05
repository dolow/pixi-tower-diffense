import GameManager from 'managers/GameManager';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {
  /**
   * ゲーム開始ボタンが押下されたときのコールバック
   */
  public onGameStartTapped(): void {
    GameManager.loadScene(new BattleScene());
  }
}
