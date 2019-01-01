import * as PIXI from 'pixi.js';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import * as UI from 'interfaces/UiGraph/index';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default abstract class Scene extends PIXI.Container {
    protected hasSceneUiGraph: boolean;
    protected uiGraph: {
        [key: string]: PIXI.Container;
    };
    protected uiGraphContainer: PIXI.Container;
    constructor();
    update(_: number): void;
    beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void;
    beginTransitionOut(onTransitionFinished: (scene: Scene) => void): void;
    loadResource(onResourceLoaded: () => void): void;
    protected onResourceLoaded(): void;
    protected createResourceList(): LoaderAddParam[];
    protected applySceneUiGraph(uiData: UI.Graph): void;
    protected getCustomUiGraphFactory(_type: string): UiNodeFactory | null;
}
