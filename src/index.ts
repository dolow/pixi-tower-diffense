import TitleScene from './scenes/TitleScene';
import GameManager from './GameManager';

window.onload = () => {
  GameManager.start(new TitleScene(), {
    width: 640,
    height: 1136,
    option: {
      backgroundColor: 0x222222
    }
  });
};
