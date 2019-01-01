import * as PIXI from 'pixi.js';
import ResourceMaster from 'ResourceMaster';
import LoaderAddParam from 'interfaces/PixiTypePolyfill/LoaderAddParam';
import GameManager from 'managers/GameManager';
import BattleManager from 'managers/BattleManager';
import Scene from 'scenes/Scene';
import UiNodeFactory from 'modules/UiNodeFactory/UiNodeFactory';
import UnitButtonFactory from 'modules/UiNodeFactory/battle/UnitButtonFactory';
import UnitButton from 'display/battle/UnitButton';
import Unit from 'entity/actor/Unit';
import Background from 'display/battle/Background';

const debugMaxUnitCount = 5;
const debugUnits: number[] = [1, -1, 3, -1, 5];

const BattleState = Object.freeze({
  LOADING_RESOURCES: 1,
  READY: 2,
  INGAME: 3,
  FINISHED: 4
})

export default class BattleScene extends Scene {
  private maxUnitCount!: number;
  private unitIds!: number[];

  private state!: number;
  private manager!: BattleManager;

  private background!: Background;
  private unitButtons!: UnitButton[];

  constructor() {
    super();

    Debug: {
      this.maxUnitCount = debugMaxUnitCount;
      this.unitIds = debugUnits;
    }

    if (this.unitIds.length <= 0) {
      throw new Error('at lease one unit id is required.');
    }

    this.interactive = true;
    this.on('pointerdown',   (e: PIXI.interaction.InteractionEvent) => this.onPointerDown(e));
    this.on('pointermove',   (e: PIXI.interaction.InteractionEvent) => this.onPointerMove(e));
    this.on('pointercancel', (e: PIXI.interaction.InteractionEvent) => this.onPointerUp(e));
    this.on('pointerup',     (e: PIXI.interaction.InteractionEvent) => this.onPointerUp(e));
    this.on('pointerout',    (e: PIXI.interaction.InteractionEvent) => this.onPointerUp(e));

    this.manager = new BattleManager();
    this.manager.onUnitsSpawned = (units) => this.onGameMasterSpawnedUnits(units);
    this.manager.onAvailableCostUpdated = (units) => this.onGameMasterUpdatedCost(units);

    Debug: {
      this.manager.costRecoveryPerFrame = 1;
      this.manager.maxAvailableCost     = 1000;
    }

    this.state = BattleState.LOADING_RESOURCES;

    this.background  = new Background();
    this.unitButtons = [];
  }

  private pointerDownCount: number = 0;
  private lastPointerPositionX: number = 0;

  private onPointerDown(event: PIXI.interaction.InteractionEvent): void {
    this.pointerDownCount++;
    console.log("onPointerDown", this.pointerDownCount);
    if (this.pointerDownCount === 1) {
      this.lastPointerPositionX = event.data.global.x;
    }
  }

  private onPointerMove(event: PIXI.interaction.InteractionEvent): void {
    if (this.pointerDownCount <= 0) {
      return;
    }

    const xPos = event.data.global.x;

    let newBackgroundPos = this.background.position.x + (xPos - this.lastPointerPositionX);

    const maxLeft = 0;
    const maxRight = -(this.background.width - GameManager.instance.game.screen.width);

    if (newBackgroundPos > maxLeft) {
      newBackgroundPos = 0;
    } else if (newBackgroundPos < maxRight) {
      newBackgroundPos = maxRight;
    }

    this.background.position.x = newBackgroundPos;
    this.lastPointerPositionX = xPos;
  }

  private onPointerUp(_: PIXI.interaction.InteractionEvent): void {
    this.pointerDownCount--;
    console.log("onPointerUp", this.pointerDownCount);
    if (this.pointerDownCount < 0) {
      this.pointerDownCount = 0;
    }
  }

  protected createResourceList(): LoaderAddParam[] {
    const assets = super.createResourceList();

    for (let i = 0; i < this.unitIds.length; i++) {
      const unitId = this.unitIds[i];
      if (unitId >= 0) {
        const unitUrl      = ResourceMaster.UnitTexture(unitId);
        const unitPanelUrl = ResourceMaster.UnitPanelTexture(unitId);
        assets.push({ name: unitUrl,      url: unitUrl });
        assets.push({ name: unitPanelUrl, url: unitPanelUrl});
      }
    }

    const unitMasterUrl = ResourceMaster.UnitMaster(this.unitIds);
    assets.push({ name: ResourceMaster.UnitMasterEntryPoint(), url: unitMasterUrl });

    // load empty button
    if (this.unitIds.indexOf(-1) >= 0) {
      const emptyPanelUrl = ResourceMaster.UnitPanelTexture(-1);
      assets.push({ name: emptyPanelUrl, url: emptyPanelUrl });
    }

    const bgResources = Background.resourceList;
    for (let i = 0; i < bgResources.length; i++) {
      const bgResourceUrl = bgResources[i];
      assets.push({ name: bgResourceUrl, url: bgResourceUrl });
    }

    return assets;
  }

  protected onResourceLoaded(): void {
    const masterData = PIXI.loader.resources[ResourceMaster.UnitMasterEntryPoint()];
    this.manager.setUnitDataMaster(masterData.data);

    this.background.init();
    this.addChild(this.background);
    this.addChild(this.uiGraphContainer);

    this.state = BattleState.READY;
  }

  public update(delta: number): void {
    switch (this.state) {
      case BattleState.LOADING_RESOURCES: break;
      case BattleState.READY: {
        this.state = BattleState.INGAME;
        break;
      }
      case BattleState.INGAME: {
        this.manager.update(delta);
        break;
      }
    }
  }

  public beginTransitionIn(onTransitionFinished: (scene: Scene) => void): void {
    this.initUnitButtons(this.unitIds);

    onTransitionFinished(this);
  }

  /**
   * GameMaster events
   */
  private onGameMasterSpawnedUnits(units: Unit[]): void {
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      unit.sprite.position.y = 200 + Math.random() * 200;
      this.background.addChild(unit.sprite);
    }
  }
  private onGameMasterUpdatedCost(cost: number): void {
    (this.uiGraph.cost_text as PIXI.Text).text = `${cost}`;
  }

  /**
   * UnitButton event
   */
  public onUnitButtonTapped(buttonIndex: number): void {
    if (this.state !== BattleState.INGAME) {
      return;
    }

    this.manager.requestSpawnPlayer(this.unitButtons[buttonIndex].unitId);
  }

  private initUnitButtons(unitIds: number[]): void {
    this.unitButtons = [];

    for (let unitButtonIndex = 0; unitButtonIndex < this.maxUnitCount; unitButtonIndex++) {
      const uiGraphUnitButtonName = `unit_button_${unitButtonIndex+1}`;
      const unitButton = this.uiGraph[uiGraphUnitButtonName] as UnitButton;
      if (!unitButton) {
        continue;
      }

      InitIndividual: {
        const unitId     = unitIds[unitButtonIndex];
        const resourceId = ResourceMaster.UnitPanelTexture(unitId);
        const texture = PIXI.loader.resources[resourceId].texture;
        if (!texture) {
          continue;
        }

        unitButton.slotIndex = unitButtonIndex;
        unitButton.unitId    = unitId;
        unitButton.texture   = texture;
      }

      this.unitButtons[unitButtonIndex] = unitButton;
    }
  }

  protected getCustomUiGraphFactory(type: string): UiNodeFactory | null {
    if (type === 'unit_button') {
      return new UnitButtonFactory();
    }
    return null;
  }
}
