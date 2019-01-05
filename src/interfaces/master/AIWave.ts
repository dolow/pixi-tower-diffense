/**
 * AI ユニットの出現情報
 */
export default interface AIWaveMaster {
  // data
  waves: {
    [key: string]: {
      unitId: number
    }[]
  }
}
