import TitleScene from 'scenes/TitleScene';
import GameManager from 'managers/GameManager';

window.onload = () => {
  GameManager.start({
    width: 1136,
    height: 640,
    option: {
      backgroundColor: 0x222222
    }
  });

  GameManager.loadScene(new TitleScene());

  Debug: {
    (window as any).GameManager = GameManager;
  }
};
