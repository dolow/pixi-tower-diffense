import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
export default class BattleScene extends Scene {
    private maxUnitCount;
    private unitIds;
    constructor();
    protected createResourceList(): LoaderAddParam[];
    protected onResourceLoaded(): void;
    protected getCustomUiGraphFactory(type: string): UiNodeFactory | null;
}
