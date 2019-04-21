/**
 * 拠点とユニットのパラメータマスターの基本 I/F
 */
export default interface AttackableMaster {
  cost:            number;
  maxHealth:       number;
  power:           number;
  speed:           number;
  knockBackFrames: number;
  knockBackSpeed:  number;
}
