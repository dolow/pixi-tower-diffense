import * as PIXI from 'pixi.js'
import ResourceMaster from 'ResourceMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButtonFactory from 'modules/UiNodeFactory/battle/UnitButtonFactory';
import UnitButton from 'nodes/battle/UnitButton';

const debugMaxUnitCount = 5;
const debugUnits: number[] = [1, -1, -1, -1, -1];

export default class BattleScene extends Scene {
  private maxUnitCount!: number;
  private unitIds!: number[];

  constructor() {
    super();

    Debug: {
      this.maxUnitCount = debugMaxUnitCount;
      this.unitIds = debugUnits;
    }

    if (this.unitIds.length <= 0) {
      throw new Error('at lease one unit id is required.');
    }
  }

  protected createResourceList(): LoaderAddParam[] {
    const assets = super.createResourceList();

    for (let i = 0; i < this.unitIds.length; i++) {
      const unitId = this.unitIds[i];
      if (unitId >= 0) {
        const unitUrl      = ResourceMaster.Unit(unitId);
        const unitPanelUrl = ResourceMaster.UnitPanel(unitId);
        assets.push({ name: unitUrl,      url: unitUrl });
        assets.push({ name: unitPanelUrl, url: unitPanelUrl});
      }
    }

    // load empty button
    if (this.unitIds.indexOf(-1) >= 0) {
      const emptyPanelUrl = ResourceMaster.UnitPanel(-1);
      assets.push({ name: emptyPanelUrl, url: emptyPanelUrl });
    }

    return assets;
  }

  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    for (let unitButtonIndex = 0; unitButtonIndex < this.maxUnitCount; unitButtonIndex++) {
      const uiGraphUnitButtonName = `unit_button_${unitButtonIndex+1}`;
      const unitButton = this.uiGraph[uiGraphUnitButtonName] as UnitButton;
      if (!unitButton) {
        continue;
      }

      const unitId     = this.unitIds[unitButtonIndex];
      const resourceId = ResourceMaster.UnitPanel(unitId);
      const texture = PIXI.loader.resources[resourceId].texture;
      if (!texture) {
        continue;
      }

      unitButton.slotIndex = unitButtonIndex;
      unitButton.unitId    = unitId;
      unitButton.texture   = texture;
    }

    onTransitionFinished(this);
  }

  public onUnitButtonTapped(panelSlotIndex: number): void {
    console.log("panelSlotIndex", panelSlotIndex);
  }

  protected getCustomUiGraphFactory(type: string): UiNodeFactory | null {
    let Factory = null;

    switch (type) {
      case 'unit_button': Factory = UnitButtonFactory;
    }

    if (Factory) {
      return new Factory();
    }

    return null;
  }
}
