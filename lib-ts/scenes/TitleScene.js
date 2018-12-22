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
//import * as PIXI from 'pixi.js'
import GameManager from '../GameManager';
import Scene from './Scene';
import BattleScene from 'scenes/BattleScene';
var TitleScene = /** @class */ (function (_super) {
    __extends(TitleScene, _super);
    //private text!: PIXI.Text;
    function TitleScene() {
        return _super.call(this, 'assets/ui/title_scene.json') || this;
        //const screen = GameManager.instance.game.screen;
        //this.ui.title_text.interactive = true;
        //this.ui.title_text.on('pointerdown', this.onGameStartTapped, this);
        //this.addChild(this.text);
    }
    TitleScene.prototype.onGameStartTapped = function () {
        GameManager.loadScene(new BattleScene());
    };
    return TitleScene;
}(Scene));
export default TitleScene;
//# sourceMappingURL=TitleScene.js.map