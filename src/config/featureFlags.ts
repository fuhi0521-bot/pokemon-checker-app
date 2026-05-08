/**
 * 機能ON/OFFスイッチ
 * 知財・収益化の方針に応じて変更する。
 */
export const featureFlags = {
  /** 広告本実装ON/OFF (現在OFF) */
  ads: false,
  /** 開発中の広告枠グレー表示 */
  adsPlaceholder: false,
  /** ステータス計算機の表示 */
  statsCalculator: true,
  /** 1体タイプ確認の表示 */
  singleTypeChecker: true,
  /** 素早さランキングの表示 */
  speedRanking: true,
  /** ダメージ計算の表示 */
  damageCalc: true,
  /** チームバランス分析の表示 */
  teamBalance: true,
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;
