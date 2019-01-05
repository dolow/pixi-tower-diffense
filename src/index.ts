import TitleScene from 'scenes/TitleScene';
import GameManager from 'managers/GameManager';

/**
 * エントリーポイント
 * window.load のタイミングで GameManager を起動する
 */
window.onload = () => {
  GameManager.start({
    width: 1136,
    height: 640,
    option: {
      backgroundColor: 0x222222
    }
  });
  // 最初の新の読み込み
  GameManager.loadScene(new TitleScene());

  Debug: {
    (window as any).GameManager = GameManager;
  }
};
