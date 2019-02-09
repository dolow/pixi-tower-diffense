import * as PIXI from 'pixi.js';

/**
 * 設定オブジェクト
 */
const Config = Object.freeze({
  // リソースのエントリーポイント
  ResourceBaseUrl: 'assets/'
});

PIXI.loader.baseUrl = Config.ResourceBaseUrl;

export default Config;
