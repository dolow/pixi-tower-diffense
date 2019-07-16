//import FirstScene from 'example/FirstScene';
import TitleScene from 'example/TitleScene';
import GameManager from 'example/GameManager';
import 'example/Config';

/**
 * エントリーポイント
 */
window.onload = () => {
  GameManager.start({
    glWidth: 1136,
    glHeight: 640,
    option: {
      backgroundColor: 0x222222
    }
  });
  // 最初のシーンの読み込み
  GameManager.loadScene(new TitleScene());

  // コンソールからオブジェクトを調査できるように window に生やす
  Debug: {
    (window as any).GameManager = GameManager;
  }
};
