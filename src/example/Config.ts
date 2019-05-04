import * as PIXI from 'pixi.js';

/**
 * 設定オブジェクト
 */
const Config = Object.freeze({
  // リソースのエントリーポイント
  ResourceBaseUrl: 'assets/',
  // ユニット枠最大数
  MaxUnitSlotCount: 5
});

PIXI.loader.baseUrl = Config.ResourceBaseUrl;

export default Config;
