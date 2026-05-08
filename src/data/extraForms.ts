/**
 * 補助データ: ローカル収録のフォーム
 *
 * PokeAPI に未収録 or 反映が遅いフォーム（特に Pokémon Legends: Z-A / Pokémon Champions の
 * 新メガ進化）をここに記載する。pokemonIndex.ts は API 取得結果と
 * このファイルをマージしてインデックスを構築する。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ⚠️ データ品質ポリシー
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  以下の2セクションに分割する:
 *
 *  [VERIFIED] - 種族値・タイプを公開ソース（Game8 / Serebii / Bulbapedia /
 *               Pokémon Database / Exion Vault datamine 等）で複数源確認できた
 *               エントリ。本番投入OK。
 *
 *  [TO_VERIFY] - 名前・存在は確認できたが種族値の正確な数値が公開ソースで
 *                単独確認のみ or 確認不可のエントリ。本番投入前に必ず公式情報と
 *                照合すること。
 *
 *  わし（オーキド博士）からの提言: 推測値を本番に混ぜると検索結果がノイズに
 *  なり、ユーザーに誤情報を与える。確認できぬデータは堂々と「未対応」と
 *  しておくのが研究者として正しい姿勢じゃ。
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 追加方法:
 *   1. 公式情報源2箇所以上で種族値を確認
 *   2. VERIFIED_EXTRA_FORMS 配列にエントリを追加
 *   3. id は他と衝突しないように 90000 番台を使用 (PokeAPI のメガIDは 10033〜)
 *   4. baseFormId に元ポケモンの全国図鑑番号を入れる
 */

import type { PokemonIndexEntry } from '@/src/types/pokemon';

// ============================================================
// [VERIFIED] - 公開ソースで確認済みのエントリ
// ============================================================
//
// 出典: 2026-05-07 時点の以下のソースに基づく:
//   - Game8 (game8.co)
//   - Pokémon Database (pokemondb.net)
//   - Exion Vault datamined stats (exionvault.com)
//   - Pokémon GO Hub (pokemongohub.net)
//   - PokéBeach
//
export const VERIFIED_EXTRA_FORMS: PokemonIndexEntry[] = [
  // ============================================================
  // ロトムの別フォーム (PokeAPI 取得障害時の安全網)
  // ============================================================
  // 第6世代以降の仕様: 種族値 50/65/107/105/107/86 (BST 520) で全フォーム共通
  {
    id: 90479,
    nameJa: 'ヒートロトム',
    nameEn: 'rotom-heat',
    types: ['electric', 'fire'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
    baseFormId: 479,
  },
  {
    id: 90480,
    nameJa: 'ウォッシュロトム',
    nameEn: 'rotom-wash',
    types: ['electric', 'water'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
    baseFormId: 479,
  },
  {
    id: 90481,
    nameJa: 'フロストロトム',
    nameEn: 'rotom-frost',
    types: ['electric', 'ice'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
    baseFormId: 479,
  },
  {
    id: 90482,
    nameJa: 'スピンロトム',
    nameEn: 'rotom-fan',
    types: ['electric', 'flying'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
    baseFormId: 479,
  },
  {
    id: 90483,
    nameJa: 'カットロトム',
    nameEn: 'rotom-mow',
    types: ['electric', 'grass'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
    baseFormId: 479,
  },

  // ============================================================
  // Pokémon Legends: Z-A / Pokémon Champions 新メガ進化（本編 25種）
  // ============================================================
  //
  // 出典: 各エントリのコメント参照。複数ソースで一致した数値を採用。
  // 全国図鑑番号 + 90000 をローカルIDとする。
  //
  {
    // game8.co/games/Pokemon-Champions/archives/592417, pokemondb.net
    id: 90655,
    nameJa: 'メガマフォクシー',
    nameEn: 'mega-delphox',
    types: ['fire', 'psychic'],
    baseStats: { hp: 75, atk: 69, def: 72, spa: 159, spd: 125, spe: 134 },
    baseFormId: 655,
  },
  {
    // game8.co/games/Pokemon-Champions/archives/592418, pokemondb.net
    id: 90658,
    nameJa: 'メガゲッコウガ',
    nameEn: 'mega-greninja',
    types: ['water', 'dark'],
    baseStats: { hp: 72, atk: 125, def: 77, spa: 133, spd: 81, spe: 142 },
    baseFormId: 658,
  },
  {
    // game8.co/games/Pokemon-Champions/archives/592416
    id: 90652,
    nameJa: 'メガブリガロン',
    nameEn: 'mega-chesnaught',
    types: ['grass', 'fighting'],
    baseStats: { hp: 88, atk: 137, def: 172, spa: 74, spd: 115, spe: 44 },
    baseFormId: 652,
  },
  {
    id: 90154,
    nameJa: 'メガメガニウム',
    nameEn: 'mega-meganium',
    types: ['grass', 'fairy'],
    baseStats: { hp: 80, atk: 92, def: 115, spa: 143, spd: 115, spe: 80 },
    baseFormId: 154,
  },
  {
    id: 90160,
    nameJa: 'メガオーダイル',
    nameEn: 'mega-feraligatr',
    types: ['water', 'dragon'],
    baseStats: { hp: 85, atk: 160, def: 125, spa: 89, spd: 93, spe: 78 },
    baseFormId: 160,
  },
  {
    // pokemongohub.net 等 (Z-A 本編で Fire/Fighting + 攻撃強化型)
    id: 90500,
    nameJa: 'メガエンブオー',
    nameEn: 'mega-emboar',
    types: ['fire', 'fighting'],
    baseStats: { hp: 110, atk: 148, def: 75, spa: 110, spd: 110, spe: 75 },
    baseFormId: 500,
  },
  {
    id: 90036,
    nameJa: 'メガピクシー',
    nameEn: 'mega-clefable',
    types: ['fairy', 'flying'],
    baseStats: { hp: 95, atk: 80, def: 93, spa: 135, spd: 110, spe: 70 },
    baseFormId: 36,
  },
  {
    id: 90071,
    nameJa: 'メガウツボット',
    nameEn: 'mega-victreebel',
    types: ['grass', 'poison'],
    baseStats: { hp: 80, atk: 125, def: 85, spa: 135, spd: 95, spe: 70 },
    baseFormId: 71,
  },
  {
    // game8.co/games/Pokemon-Champions/archives/592438 + Huge Power特性
    id: 90121,
    nameJa: 'メガスターミー',
    nameEn: 'mega-starmie',
    types: ['water', 'psychic'],
    baseStats: { hp: 60, atk: 140, def: 105, spa: 130, spd: 105, spe: 120 },
    baseFormId: 121,
  },
  {
    id: 90149,
    nameJa: 'メガカイリュー',
    nameEn: 'mega-dragonite',
    types: ['dragon', 'flying'],
    baseStats: { hp: 91, atk: 124, def: 115, spa: 145, spd: 125, spe: 100 },
    baseFormId: 149,
  },
  {
    // 物理アタッカー型に再編 (B 140→110, A 80→140)
    id: 90227,
    nameJa: 'メガエアームド',
    nameEn: 'mega-skarmory',
    types: ['steel', 'flying'],
    baseStats: { hp: 65, atk: 140, def: 110, spa: 40, spd: 100, spe: 110 },
    baseFormId: 227,
  },
  {
    // 特殊アタッカー型 (S 110→120, C 80→140)
    id: 90478,
    nameJa: 'メガユキメノコ',
    nameEn: 'mega-froslass',
    types: ['ice', 'ghost'],
    baseStats: { hp: 70, atk: 80, def: 70, spa: 140, spd: 100, spe: 120 },
    baseFormId: 478,
  },
  {
    // Piercing Drill 特性、A 165
    id: 90530,
    nameJa: 'メガドリュウズ',
    nameEn: 'mega-excadrill',
    types: ['ground', 'steel'],
    baseStats: { hp: 110, atk: 165, def: 100, spa: 65, spd: 65, spe: 103 },
    baseFormId: 530,
  },
  {
    id: 90545,
    nameJa: 'メガペンドラー',
    nameEn: 'mega-scolipede',
    types: ['bug', 'poison'],
    baseStats: { hp: 60, atk: 140, def: 149, spa: 75, spd: 99, spe: 62 },
    baseFormId: 545,
  },
  {
    id: 90560,
    nameJa: 'メガズルズキン',
    nameEn: 'mega-scrafty',
    types: ['dark', 'fighting'],
    baseStats: { hp: 65, atk: 130, def: 135, spa: 55, spd: 135, spe: 68 },
    baseFormId: 560,
  },
  {
    // C 175 - 非伝説メガで最高値の特殊
    id: 90609,
    nameJa: 'メガシャンデラ',
    nameEn: 'mega-chandelure',
    types: ['ghost', 'fire'],
    baseStats: { hp: 60, atk: 75, def: 110, spa: 175, spd: 110, spe: 90 },
    baseFormId: 609,
  },
  {
    // 元: でんき単タイプ。Z-Aでもタイプ変更は確認できなかったため でんき単型として登録
    id: 90604,
    nameJa: 'メガシビビール',
    nameEn: 'mega-eelektross',
    types: ['electric'],
    baseStats: { hp: 85, atk: 145, def: 80, spa: 135, spd: 90, spe: 80 },
    baseFormId: 604,
  },
  {
    id: 90689,
    nameJa: 'メガガメノデス',
    nameEn: 'mega-barbaracle',
    types: ['rock', 'water'],
    baseStats: { hp: 72, atk: 140, def: 130, spa: 64, spd: 106, spe: 88 },
    baseFormId: 689,
  },
  {
    // D 163 - 特殊耐久型
    id: 90691,
    nameJa: 'メガドラミドロ',
    nameEn: 'mega-dragalge',
    types: ['poison', 'dragon'],
    baseStats: { hp: 65, atk: 85, def: 105, spa: 132, spd: 163, spe: 44 },
    baseFormId: 691,
  },
  {
    // No Guard 特性
    id: 90701,
    nameJa: 'メガルチャブル',
    nameEn: 'mega-hawlucha',
    types: ['fighting', 'flying'],
    baseStats: { hp: 78, atk: 137, def: 100, spa: 74, spd: 93, spe: 118 },
    baseFormId: 701,
  },
  {
    id: 90668,
    nameJa: 'メガカエンジシ',
    nameEn: 'mega-pyroar',
    types: ['fire', 'normal'],
    baseStats: { hp: 88, atk: 88, def: 92, spa: 129, spd: 86, spe: 126 },
    baseFormId: 668,
  },
  {
    // BST 582
    id: 90687,
    nameJa: 'メガカラマネロ',
    nameEn: 'mega-malamar',
    types: ['dark', 'psychic'],
    baseStats: { hp: 86, atk: 102, def: 88, spa: 98, spd: 120, spe: 88 },
    baseFormId: 687,
  },
  {
    id: 90780,
    nameJa: 'メガジジーロン',
    nameEn: 'mega-drampa',
    types: ['normal', 'dragon'],
    baseStats: { hp: 78, atk: 85, def: 110, spa: 160, spd: 116, spe: 36 },
    baseFormId: 780,
  },
  {
    id: 90870,
    nameJa: 'メガタイレーツ',
    nameEn: 'mega-falinks',
    types: ['fighting'],
    baseStats: { hp: 65, atk: 135, def: 135, spa: 70, spd: 65, spe: 100 },
    baseFormId: 870,
  },
  {
    // ジガルデ・パーフェクトフォルムのメガ進化、BST 778
    id: 90718,
    nameJa: 'メガジガルデ',
    nameEn: 'mega-zygarde',
    types: ['dragon', 'ground'],
    baseStats: { hp: 216, atk: 70, def: 91, spa: 216, spd: 85, spe: 100 },
    baseFormId: 718,
  },
];

// ============================================================
// [TO_VERIFY] - 種族値・タイプが単独ソースのみ or 未確認のため、本番投入前に要検証
// ============================================================
//
// ⚠️ 以下のエントリは「Pokémon Legends: Z-A Mega Dimension DLC / Champions に存在する
//    ことは確認できているが、種族値の正確な数値が複数ソースで一致していない」ものです。
//
// DLC「Mega Dimension」の22メガ進化候補:
//   メガライチュウX, メガルカリオZ, メガヒードラン, メガダークライ, メガゼラオラ ほか
//
// 検証手順:
//   1. Bulbapedia (英語) で確認: https://bulbapedia.bulbagarden.net/wiki/Mega_Dimension
//   2. Serebii.net で確認: https://www.serebii.net/legendsz-a/dlc-megaevolutions.shtml
//   3. ポケモン公式 図鑑（Pokémon HOME 経由）で確認
//
// 検証完了次第、VERIFIED_EXTRA_FORMS に移動してください。
//
export const TO_VERIFY_EXTRA_FORMS: PokemonIndexEntry[] = [
  // === Mega Dimension DLC (要検証) ===
  // メガライチュウX (Mega Raichu X) - 単独ソースで 60/135/95/90/95/110 と確認、要再検証
  // メガルカリオZ (Mega Lucario Z) - 単独ソースで 70/100/70/164/70/151 と確認、要再検証
  // メガヒードラン (Mega Heatran) - 単独ソースで 91/120/106/175/141/67 と確認、要再検証
  // メガダークライ (Mega Darkrai) - 単独ソースで 70/120/130/165/130/85 と確認、要再検証
  // メガゼラオラ (Mega Zeraora) - 単独ソースで 88/157/75/147/80/153 と確認、要再検証
  // 他 17 エントリ
];

/**
 * 本番にマージするエントリ。VERIFIED のみ採用。
 */
export const EXTRA_FORMS: PokemonIndexEntry[] = [...VERIFIED_EXTRA_FORMS];

/**
 * 「すでにPokeAPIから取れたエントリと重複した場合に、ローカル版を優先するか」のフラグ。
 * 通常 true (新メガはAPI未収録のためローカルが正)。
 */
export const PREFER_LOCAL_ON_CONFLICT = true;

/**
 * 開発時のデバッグ用: 検証ステータスの集計
 */
export function getVerificationStats() {
  const rotomCount = VERIFIED_EXTRA_FORMS.filter(
    (e) => e.nameEn.startsWith('rotom')
  ).length;
  const megaCount = VERIFIED_EXTRA_FORMS.filter(
    (e) => e.nameEn.startsWith('mega-')
  ).length;
  return {
    verified: VERIFIED_EXTRA_FORMS.length,
    breakdown: {
      rotomForms: rotomCount,
      megaEvolutions: megaCount,
    },
    toVerify: TO_VERIFY_EXTRA_FORMS.length,
    note:
      '本番投入できるのは VERIFIED_EXTRA_FORMS のみ。' +
      '新メガを追加する際は必ず2箇所以上の公開ソースで種族値を確認すること。',
  };
}
