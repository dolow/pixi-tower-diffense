/**
 * バトルエンティティのステート
 */
const AttackableState = Object.freeze({
  IDLE: 1,
  ENGAGED: 2,
  KNOCK_BACK: 3,
  DEAD: 4,
  WAIT: 5
});

export default AttackableState;
