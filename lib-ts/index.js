import TitleScene from './scenes/TitleScene';
import GameManager from './GameManager';
window.onload = function () {
    GameManager.start({
        width: 1136,
        height: 640,
        option: {
            backgroundColor: 0x222222
        }
    });
    GameManager.loadScene(new TitleScene());
};
//# sourceMappingURL=index.js.map