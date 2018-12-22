import * as PIXI from 'pixi.js';
var GameManager = /** @class */ (function () {
    function GameManager(app) {
        this.game = !;
        if (GameManager.instance) {
            throw new Error('GameManager can be instantiate only once');
        }
        this.game = app;
    }
    GameManager.start = function (params) {
        var game = new PIXI.Application(params.width, params.height, params.option);
        GameManager.instance = new GameManager(game);
        document.body.appendChild(GameManager.instance.game.view);
        GameManager.instance.game.ticker.add(function (delta) {
            if (GameManager.instance.currentScene) {
                GameManager.instance.currentScene.update(delta);
            }
        });
    };
    GameManager.loadScene = function (scene) {
        var instance = GameManager.instance;
        if (instance.currentScene) {
            instance.currentScene.destroy();
        }
        instance.currentScene = scene;
        if (instance.game) {
            instance.game.stage.addChild(instance.currentScene);
        }
    };
    return GameManager;
}());
export default GameManager;
//# sourceMappingURL=GameManager.js.map