import * as PIXI from 'pixi.js';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default abstract class Scene extends PIXI.Container {
    protected hasSceneUiGraph: boolean;
    protected uiGraph: {
        [key: string]: PIXI.Container;
    };
    constructor();
    update(_: number): void;
    protected createResourceList(): LoaderAddParam[];
    protected loadResource(): void;
    protected applySceneUiGraph(uiData: UI.Graph): void;
    protected onResourceLoaded(): void;
    protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null;
}
