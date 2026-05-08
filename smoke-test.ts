import { getDefensiveProfile, typeChart } from './src/data/typeChart.ts';
import { calcStat } from './src/utils/stats.ts';
import { calcDamage } from './src/utils/damageCalc.ts';
import { analyzeTeam } from './src/utils/teamAnalysis.ts';

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { console.log('✓', msg); passed++; }
  else { console.log('✗ FAIL:', msg); failed++; }
}

// タイプ相性表
assert(typeChart.fire.grass === 2, 'ほのお→くさ = 2倍');
assert(typeChart.water.fire === 2, 'みず→ほのお = 2倍');
assert(typeChart.electric.ground === 0, 'でんき→じめん = 無効');
assert(typeChart.fighting.fairy === 0.5, 'かくとう→フェアリー = 半減');
assert(typeChart.dragon.fairy === 0, 'ドラゴン→フェアリー = 無効');
assert(typeChart.fairy.dragon === 2, 'フェアリー→ドラゴン = 2倍');
assert(typeChart.normal.ghost === 0, 'ノーマル→ゴースト = 無効');

// 複合タイプ
const fireSteel = getDefensiveProfile(['fire', 'steel']);
assert(fireSteel.ground === 2, 'ほのお/はがね vs じめん = 2倍');
assert(fireSteel.fighting === 2, 'ほのお/はがね vs かくとう = 2倍');
assert(fireSteel.bug === 0.25, 'ほのお/はがね vs むし = 1/4');
assert(fireSteel.poison === 0, 'ほのお/はがね vs どく = 無効');

const grassGround = getDefensiveProfile(['grass', 'ground']);
assert(grassGround.ice === 4, 'くさ/じめん vs こおり = 4倍');

// ステータス計算 (ピカチュウS90, Lv50, 努力252, 個体31, S補正)
const pikaSpe = calcStat(90, 'spe', {
  level: 50,
  ivs: { spe: 31 },
  evs: { spe: 252 },
  nature: { up: 'spe', down: 'atk' },
});
assert(pikaSpe === 167, `ピカチュウ Lv50 すばやさ実数値 = 167 (got ${pikaSpe})`);

const garHp = calcStat(108, 'hp', {
  level: 50,
  ivs: { hp: 31 },
  evs: { hp: 252 },
  nature: { up: null, down: null },
});
assert(garHp === 207, `ガブリアス Lv50 HP実数値 = 207 (got ${garHp})`);

// ダメージ計算
const dmg = calcDamage({
  level: 50,
  attackerTypes: ['fire'],
  defenderTypes: ['normal'],
  moveType: 'fire',
  power: 80,
  category: 'physical',
  attackerStats: { hp: 200, atk: 150, def: 100, spa: 100, spd: 100, spe: 100 },
  defenderStats: { hp: 200, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
  critical: false,
});
assert(dmg.stab === true, 'STAB判定');
assert(dmg.typeMultiplier === 1, '相性倍率 = 1');
assert(dmg.min > 0 && dmg.max >= dmg.min, `ダメージ範囲(min=${dmg.min}, max=${dmg.max})`);

// チーム分析
const team = analyzeTeam([
  { id: '1', label: 'A', types: ['water'] },
  { id: '2', label: 'B', types: ['flying'] },
  { id: '3', label: 'C', types: ['fire'] },
]);
assert(team.dangerousTypes.includes('electric'), 'でんきが危険(2匹)に分類');
assert(team.resistanceHoles.length > 0, '耐性穴が検出される');
assert(team.balanceScore >= 0 && team.balanceScore <= 100, `スコア範囲OK (${team.balanceScore})`);

console.log('\n=== Result ===');
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
