import * as WebFont from 'webfontloader';
import 'example/Config';
import Resource from 'example/Resource';
import TitleScene from 'example/TitleScene';
import GameManager from 'example/GameManager';

let fontLoaded   = false;
let windowLoaded = false;

function initGame() {
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
}

WebFont.load({
  custom: {
    families: [Resource.FontFamily.Default],
    urls: [Resource.FontFamily.Css]
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
 */
window.onload = () => {
  windowLoaded = true;
  if (fontLoaded) {
    initGame();
  }
}
