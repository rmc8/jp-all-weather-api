import type { JmaDay } from '../jma/types';

/** 摂氏 → 華氏 */
export function c2f(c: string | number): string {
  const v = Number(c);
  return Number.isFinite(v) ? String(Math.round((v * 9) / 5 + 32)) : '';
}

/** 摂氏 → ケルビン（OpenWeatherMap 準拠）。空値は null */
export function c2k(c: string | number | null | undefined): number | null {
  if (c === null || c === undefined || c === '') return null;
  const v = Number(c);
  return Number.isFinite(v) ? Math.round((v + 273.15) * 100) / 100 : null;
}

/** JMA 3桁天気コード → WMO weather_code */
export function toWmo(code: string): number {
  const n = Number(code);
  if (!code || !Number.isFinite(n)) return 800;
  const c = code[0];
  switch (c) {
    case '1': // 晴系
      return n === 101 || n === 110 || n === 111 || n === 112 ? 1 : 0;
    case '2': // 曇系
      return n === 201 || n === 210 ? 2 : 3;
    case '3': // 雨系
      return n === 303 ? 67 : 61;
    case '4': // 雪系
      return n === 403 ? 67 : 71;
    case '5': // 雷系
      return 95;
    default:
      return 800;
  }
}

/** JMA 3桁天気コード → 日本語テロップ（weathers テキストが無い場合のフォールバック） */
export function codeToTelop(code: string): string {
  const map: Record<string, string> = {
    '100': '晴れ',
    '101': '晴れ時々曇り',
    '102': '晴れ一時雨',
    '103': '晴れ時々雨',
    '104': '晴れ一時雪',
    '105': '晴れ時々雪',
    '106': '晴れ一時雨か雪',
    '107': '晴れ時々雨か雪',
    '108': '晴れ一時雨か雪',
    '110': '晴れのち時々曇り',
    '111': '晴れのち一時雨',
    '112': '晴れのち時々雨',
    '113': '晴れのち一時雪',
    '114': '晴れのち時々雪',
    '200': '曇り',
    '201': '曇り時々晴れ',
    '202': '曇り一時雨',
    '203': '曇り時々雨',
    '204': '曇り一時雪',
    '205': '曇り時々雪',
    '206': '曇り一時雨か雪',
    '207': '曇り時々雨か雪',
    '210': '曇りのち時々晴れ',
    '211': '曇りのち一時雨',
    '212': '曇りのち時々雨',
    '300': '雨',
    '301': '雨時々止み',
    '302': '雨時々雪',
    '303': '雨か雪',
    '311': '雨のち晴れ',
    '312': '雨のち曇り',
    '313': '雨のち時々雪',
    '400': '雪',
    '401': '雪時々止み',
    '402': '雪時々雨',
    '403': '雪か雨',
    '411': '雪のち晴れ',
    '412': '雪のち曇り',
    '500': '雷',
    '501': '雷時々雨',
    '502': '雷時々雪',
  };
  return map[code] ?? '';
}

/** JMA 3桁天気コード → アイコン分類 */
export function iconCategory(code: string): string {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return 'sun';
    case '2':
      return 'cloud';
    case '3':
      return 'rain';
    case '4':
      return 'snow';
    case '5':
      return 'thunder';
    default:
      return 'cloud';
  }
}

/** 天気コード → OWM風 description（英語） */
export function owmDescription(code: string): string {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return 'clear sky';
    case '2':
      return 'overcast clouds';
    case '3':
      return 'light rain';
    case '4':
      return 'light snow';
    case '5':
      return 'thunderstorm';
    default:
      return 'overcast clouds';
  }
}

/** 天気コード → OWM風 main */
export function owmMain(code: string): string {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return 'Clear';
    case '2':
      return 'Clouds';
    case '3':
      return 'Rain';
    case '4':
      return 'Snow';
    case '5':
      return 'Thunderstorm';
    default:
      return 'Clouds';
  }
}

/** 天気コード → OWM icon id (例: 01d) */
export function owmIcon(code: string): string {
  const map: Record<string, string> = {
    sun: '01',
    cloud: '03',
    rain: '09',
    snow: '13',
    thunder: '11',
  };
  return `${map[iconCategory(code)] ?? '03'}d`;
}

/** 説明文の先頭文（改行をスペースに） */
export function firstSentence(text: string): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  return clean.split('。')[0] + (clean.includes('。') ? '。' : '');
}

/** JmaDay の数値ヘルパー */
export function num(v: string | null): number | null {
  return v === null || v === '' ? null : Number(v);
}

/** 降水確率を Livedoor 形式の時間帯別オブジェクトにする（本APIは日単位のため同値） */
export function popObject(pop: string | null): Record<string, string> {
  const p = pop === null || pop === '' ? '--' : `${pop}%`;
  return { T00_06: p, T06_12: p, T12_18: p, T18_24: p };
}

/** 天気コードから JmaDay の現在気温（最高）を摂氏・華氏で返す */
export function tempReading(day?: JmaDay): {
  celsius: string | null;
  fahrenheit: string | null;
} {
  if (!day?.tempMax) return { celsius: null, fahrenheit: null };
  return {
    celsius: day.tempMax,
    fahrenheit: c2f(day.tempMax),
  };
}
