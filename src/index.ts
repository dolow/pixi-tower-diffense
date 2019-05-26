import * as PIXI from 'pixi.js';
import * as WebFont from 'webfontloader';
import 'example/Config';
import Resource from 'Resource';
import TitleScene from 'example/TitleScene';
import GameManager from 'example/GameManager';

let fontLoaded   = false;
let windowLoaded = false;

function initGame() {
  const width = 1136;
  const height = 640;

  const pixiAppOption: PIXI.ApplicationOptions = {
    backgroundColor: 0x222222
  };

  Debug: {
    // コンソールからオブジェクトを調査できるように window に生やす
    (window as any).GameManager = GameManager;

    // 画面キャプチャ
    pixiAppOption.preserveDrawingBuffer = true;
    document.body.addEventListener('keydown', (event) => {
      if (event.ctrlKey === true && event.key === 'c') {
        const a = document.createElement("a");

        a.setAttribute("href", GameManager.instance.game.view.toDataURL());
        a.setAttribute("download", `figure_${new Date().getTime()}`);
        a.click();
      }
    });
  }


  GameManager.start({
    glWidth: width,
    glHeight: height,
    option: pixiAppOption
  });
  // 最初のシーンの読み込み
  GameManager.loadScene(new TitleScene());
}

WebFont.load({
  custom: {
    families: [Resource.FontFamily.Default],
    urls: [Resource.FontFamily.Css]
  },
  inactive: () => {
    fontLoaded = true;
    if (windowLoaded) {
      initGame();
    }
  },
  active: () => {
    fontLoaded = true;
    if (windowLoaded) {
      initGame();
    }
  },
  timeout: 5000
});

/**
 * エントリーポイント
 */
const onload = () => {
  windowLoaded = true;
  if (fontLoaded) {
    initGame();
  }
}

window.onload = onload;

if (document.readyState === 'complete') {
  onload();
}
