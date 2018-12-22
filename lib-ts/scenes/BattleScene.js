var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as PIXI from 'pixi.js';
import GameManager from '../GameManager';
import Scene from './Scene';
var BattleScene = /** @class */ (function (_super) {
    __extends(BattleScene, _super);
    function BattleScene() {
        var _this = _super.call(this) || this;
        var screen = GameManager.instance.game.screen;
        var text = new PIXI.Text("BattleScene", new PIXI.TextStyle({
            fontSize: 48,
            fill: 0xffffff
        }));
        text.position.set((screen.width - text.width) * 0.5, (screen.height - text.height) * 0.5);
        _this.addChild(text);
        return _this;
        //this.text.on('tap', this.onGameStartTapped);
    }
    return BattleScene;
}(Scene));
export default BattleScene;
//# sourceMappingURL=BattleScene.js.map