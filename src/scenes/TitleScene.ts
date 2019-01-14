import GameManager from 'managers/GameManager';
import Scene from 'scenes/Scene';
import BattleScene from 'scenes/BattleScene';
import FadeIn from 'scenes/transition/FadeIn';
import FadeOut from 'scenes/transition/FadeOut';

/**
 * タイトルシーン
 */
export default class TitleScene extends Scene  {

  constructor() {
    super();
    this.transitionIn  = new FadeIn();
    this.transitionOut = new FadeOut();
  }

  /**
   * ゲーム開始ボタンが押下されたときのコールバック
   */
  public onGameStartTappedDown(): void {
    if (!this.transitionIn.isFinished()) {
      return;
    }
    this.uiGraph.title_off.alpha = 0;
  }
  /**
   * ゲーム開始ボタン押下が離されたされたときのコールバック
   */
  public onGameStartTappedUp(): void {
    if (!this.transitionIn.isFinished()) {
      return;
    }
    this.uiGraph.title_off.alpha = 1;
    GameManager.loadScene(new BattleScene());
  }
}
