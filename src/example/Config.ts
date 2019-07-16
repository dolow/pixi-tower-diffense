import * as PIXI from 'pixi.js';

const Config = Object.freeze({
    ResourceBaseUrl: 'assets/'
});

// PIXI の loader プロパティに baseUrl を設定
PIXI.loader.baseUrl = Config.ResourceBaseUrl;

export default Config;
