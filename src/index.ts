import * as WebFont from 'webfontloader';
import TitleScene from 'scenes/TitleScene';
import GameManager from 'managers/GameManager';

function initGame() {
  GameManager.start({
    glWidth: 1136,
    glHeight: 640,
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerWidth * (640 / 1136),
    option: {
      backgroundColor: 0x222222
    }
  });
  // 最初のシーンの読み込み
  GameManager.loadScene(new TitleScene());

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
    families: ['MisakiGothic'],
    urls: ['font.css']
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
