import * as PIXI from 'pixi.js';
/**
 * ユニットや拠点が配置されるバトル背景のクラス
 */
export default class Field extends PIXI.Container {
    /**
     * タップダウン数カウント
     * タップダウン重複処理を防止するために数える
     */
    private pointerDownCount;
    /**
     * タップ位置の X 座標
     * スクロール処理のために保持する
     */
    private lastPointerPositionX;
    /**
     * スクロールの限界座標値
     */
    private foregroundScrollLimit;
    /**
     * 表示上の前後関係を制御するための PIXI.Container オブジェクト
     */
    private containers;
    /**
     * ユニットが配置される前景の PIXI.Container 配列
     */
    private foreZLines;
    /**
     * このクラスで利用するリソースリスト
     */
    static readonly resourceList: string[];
    /**
     * foreZLines の要素の数を返す
     */
    readonly zLineCount: number;
    /**
     * コンストラクタ
     */
    constructor();
    /**
     * フィールドの長さとユニットを配置するラインの数で初期化する
     */
    init(options?: any): void;
    /**
     * 前景内で背景エフェクトとして addChild する
     */
    addChildAsForeBackgroundEffect(container: PIXI.Container): void;
    /**
     * 前景内で前景エフェクトとして addChild する
     */
    addChildAsForeForegroundEffect(container: PIXI.Container): void;
    /**
     * 指定した zLine インデックスの PIXI.Container に addChild する
     */
    addChildToZLine(container: PIXI.Container, zlineIndex: number): void;
    /**
     * タップ押下時の制御コールバック
     */
    private onPointerDown;
    /**
     * タップ移動時の制御コールバック
     */
    private onPointerMove;
    /**
     * タップ終了時の制御コールバック
     */
    private onPointerUp;
}
