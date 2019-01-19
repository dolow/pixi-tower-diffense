export default interface UpdateObject {
  isDestroyed(): boolean;
  update(_dt: number): void;
}
