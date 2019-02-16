import * as WebFont from 'webfontloader';
import 'Config';
import Resource from 'Resource';
import TitleScene from 'scenes/TitleScene';
import GameManager from 'managers/GameManager';

/**
 * ゲームの初期化処理
 */
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
