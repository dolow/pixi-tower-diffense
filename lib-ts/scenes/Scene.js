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
var _this = this;
import * as PIXI from 'pixi.js';
import * as UI from 'interfaces/UiGraph/index';
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    function Scene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ui = !;
        return _this;
    }
    return Scene;
}(PIXI.Container));
export default Scene;
{
    [key, string];
    PIXI.Container;
}
;
constructor(uiGraphUrl ?  : string);
{
    _this = _super.call(this) || this;
    this.ui = {};
    if (uiGraphUrl) {
        this.loadUiGraph(uiGraphUrl);
    }
    else {
        this.onUiLoaded();
    }
}
update(_, number);
void {};
loadUiGraph(uiGraphUrl, string);
void {
    PIXI: .loader.add({ name: uiGraphUrl, url: uiGraphUrl }).load(function (_loader, resources) {
        var uiData = resources.ui.data;
        for (var i = 0; i < uiData.nodes.length; i++) {
            var nodeData = uiData.nodes[i];
            var node = _this.createUiNodeByGraphElement(nodeData);
            if (node) {
                _this.ui[nodeData.id] = node;
                _this.addChild(node);
            }
        }
        _this.onUiLoaded();
    })
};
createUiNodeByGraphElement(nodeData, UI.Node);
PIXI.Container | null;
{
    var node = null;
    var nodeParams = nodeData.params;
    switch (nodeData.type) {
        case 'text': {
            var textParams = nodeParams;
            var textStyleParams = {};
            if (textParams.size !== undefined) {
                textStyleParams.fontSize = textParams.size;
            }
            if (textParams.color !== undefined) {
                textStyleParams.fill = textParams.color;
            }
            node = new PIXI.Text(textParams.text || '', new PIXI.TextStyle(textStyleParams));
        }
    }
    if (node) {
        node.name = nodeData.id;
        node.position.set(nodeData.position[0], nodeData.position[1]);
        if (nodeData.event) {
            if (this.hasOwnProperty(nodeData.event.callback)) {
                node.interactive = true;
                node.on(nodeData.event.type, this[nodeData.event.callback], this);
            }
        }
    }
    return null;
}
onUiLoaded();
void {};
//# sourceMappingURL=Scene.js.map