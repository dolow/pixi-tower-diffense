import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default class BattleScene extends Scene {
    private maxUnitCount;
    private unitIds;
    private state;
    private manager;
    private background;
    private unitButtons;
    constructor();
    private pointerDownCount;
    private lastPointerPositionX;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
    protected createResourceList(): LoaderAddParam[];
    protected onResourceLoaded(): void;
    update(delta: number): void;
    beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void;
    /**
     * GameMaster events
     */
    private onGameMasterSpawnedUnits;
    private onGameMasterUpdatedCost;
    /**
     * UnitButton event
     */
    onUnitButtonTapped(buttonIndex: number): void;
    private initUnitButtons;
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
}
