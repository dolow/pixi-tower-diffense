import * as WebFont from 'webfontloader';
import 'Config';
import Resource from 'Resource';
import MinUiGraphScene from 'example/MinUiGraphScene';
import GameManager from 'managers/GameManager';

/**
 * ゲームの初期化処理
 */
function initGame() {
  const width = 1136;
  const height = 640;

  GameManager.start({
    glWidth: width,
    glHeight: height,
    option: {
      backgroundColor: 0x222222
    }
  });
  // 最初のシーンの読み込み
  GameManager.loadScene(new MinUiGraphScene());

  // コンソールからオブジェクトを調査できるように window に生やす
  Debug: {
    (window as any).GameManager = GameManager;
  }
}

let fontLoaded   = false;
let windowLoaded = false;

/**
 * フォント読みこみ
 * window 読み込みも完了していたらゲームを起動する
 */
WebFont.load({
  custom: {
    families: [Resource.FontFamily.Default],
    urls: ['base.css']
  },
  active: () => {
    fontLoaded = true;
    if (windowLoaded) {
      initGame();
    }
  }
});

/**
 * エントリーポイント
 * フォント読み込みも完了していたらゲームを起動する
 */
window.onload = () => {
  windowLoaded = true;
  if (fontLoaded) {
    initGame();
  }
};
