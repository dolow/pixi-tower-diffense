import * as PIXI from 'pixi.js';
import { Graph, Node, Event } from 'interfaces/UiGraph';
import Scene from 'scenes/Scene';

/**
 * データで表現された UI を読み込んで表示するサンプル
 */
export default class MinUiGraphScene extends Scene  {
  /**
   * UI 情報が定義された json ファイル URL
   */
  private readonly jsonUrl: string = 'ui_graph/min_ui_graph_scene.json';
  /**
   * json ファイルをパースしたオブジェクト
   */
  private json: Graph | null = null;
  /**
   * json ファイルを元に作られた UI系インスタンスのオブジェクト
   */
  private ui: { [id: string]: PIXI.Container } = {};

  /**
   * UI 情報が定義された json をダウンロードする
   * GameManager によって初期化時にコールされる
   * 本来は Scene で透過的に UI 情報を取得するが、サンプルとして明示的に処理する
   */
  public beginLoadResource(onLoaded: () => void): Promise<void> {
    return new Promise((resolve) => {
      PIXI.loader.add(this.jsonUrl).load(() => {
        this.onJsonLoaded();
        onLoaded();
      });
      resolve();
    });
  }

  /**
   * json がダウンロードされたら PIXI.Container 派生インスタンスを画面に追加する
   * また、スプライトに必要なテクスチャをダウンロードする
   */
  private onJsonLoaded(): void {
    this.json = PIXI.loader.resources[this.jsonUrl].data as Graph;

    this.addUiContainers(this.json.nodes);

    const textures = this.collectTextureUrls(this.json.nodes);
    PIXI.loader.add(textures).load(() => this.onTexturesLoaded());
  }

  /**
   * Sprite に必要なテクスチャの URL を集める
   */
  private collectTextureUrls(nodes: Node[]): string[] {
    const urls = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type !== 'sprite')             continue;
      if (!node.params || !node.params.url)   continue;
      if (urls.indexOf(node.params.url) >= 0) continue;

      urls.push(node.params.url);
    }

    return urls;
  }

  /**
   * テクスチャがダウンロードされたら割り当てる
   */
  private onTexturesLoaded(): void {
    if (!this.json) return;

    for (let i = 0; i < this.json.nodes.length; i++) {
      const node = this.json.nodes[i];
      if (node.type !== 'sprite')                   continue;
      if (!node.params || !node.params.textureName) continue;
      if (!this.ui[node.id])                        continue;

      const texture = PIXI.utils.TextureCache[node.params.textureName];

      if (texture) {
        (this.ui[node.id] as PIXI.Sprite).texture = texture;
      }
    }
  }

  /**
   * 要素の種類ごとに初期化メソッドを実行する
   * 本実装ではここの処理はカプセル化しており、ここではサンプルとして明示的に処理している
   */
  private addUiContainers(nodes: Node[]): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // インスタンスを生成する
      let container;
      switch (node.type) {
        case 'sprite': container = this.createSprite(node); break;
        case 'text':   container = this.createText(node);   break;
        default: break;
      }

      if (!container) continue;

      container.position.x = node.position[0];
      container.position.y = node.position[1];
      this.ui[node.id] = container;
      this.addChild(container);

      if (node.events) {
        this.attachEvents(container, node.events);
      }
    }
  }

  /**
   * PIXI.Sprite インスタンスを作成して addChild する
   */
  private createSprite(_: Node): PIXI.Container {
    return new PIXI.Sprite();
  }
  /**
   * PIXI.Text インスタンスを作成して addChild する
   */
  private createText(node: Node): PIXI.Container {
    const text = new PIXI.Text();

    if (node.params) {
      text.text = node.params.text;

      const style: PIXI.TextStyleOptions = {};
      if (node.params.family)  style.fontFamily = node.params.family;
      if (node.params.size)    style.fontSize   = node.params.size;
      if (node.params.color)   style.fill       = node.params.color;
      if (node.params.padding) style.padding    = node.params.padding;

      text.style = new PIXI.TextStyle(style);
    }

    return text;
  }

  /**
   * イベント処理を設定する
   */
  private attachEvents(container: PIXI.Container, events: Event[]): void {
    container.interactive = true;

    for (let j = 0; j < events.length; j++) {
      const event = events[j];
      container.on(event.type, () => (this as any)[event.callback](...event.arguments));
    }
  }

  /**
   * UI 情報として定義されたイベントコールバックメソッド
   */
  public onStageArrowTapped(...args: any[]): void {
    console.log('onStageArrowTapped invoked!!', args);
  }
  public onUnitArrowTapped(...args: any[]): void {
    console.log('onUnitArrowTapped invoked!!', args);
  }
  public onOkButtonDown(...args: any[]): void {
    console.log('onOkButtonDown invoked!!', args);
    this.ui.ok_button_off.visible = false;
  }
  public onOkButtonUp(...args: any[]): void {
    console.log('onOkButtonUp invoked!!', args);
    this.ui.ok_button_off.visible = true;
  }
}
