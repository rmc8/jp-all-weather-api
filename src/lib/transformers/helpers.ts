import telopsData from '../jma/telops.json';

type TelopEntry = [
  dayIcon: string,
  nightIcon: string,
  baseCode: string,
  nameJa: string,
  nameEn: string,
];

export const JMA_TELOPS = telopsData as Record<string, TelopEntry>;

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

/** 雷を伴う天気コードか判定 */
export function isThunder(code: string): boolean {
  const entry = JMA_TELOPS[code];
  if (entry) {
    return entry[3].includes('雷') || entry[4].includes('THUNDER');
  }
  return code.startsWith('5') || ['108', '119', '123', '125', '140', '208', '219', '240', '250', '350', '450'].includes(code);
}

/** 晴れ＋曇りの複合天気（Partly Cloudy）か判定 */
export function isPartlyCloudy(code: string): boolean {
  return ['101', '110', '111', '132', '201', '210', '211', '223'].includes(code);
}

/** 基底コードを取得（100:晴, 200:曇, 300:雨, 400:雪） */
export function getBaseCode(code: string): string {
  const entry = JMA_TELOPS[code];
  if (entry) return entry[2];
  const c = (code || '')[0];
  if (c === '1') return '100';
  if (c === '2') return '200';
  if (c === '3') return '300';
  if (c === '4') return '400';
  return '200';
}

/** JMA 3桁天気コード → WMO weather_code */
export function toWmo(code: string): number {
  if (!code) return 800;
  if (isThunder(code)) return 95;

  const base = getBaseCode(code);
  switch (base) {
    case '100': // 晴系
      return isPartlyCloudy(code) ? 1 : 0;
    case '200': // 曇系
      return isPartlyCloudy(code) ? 2 : 3;
    case '300': // 雨系
      if (code === '306' || code === '308' || code === '328') return 65; // heavy rain
      if (code === '302' || code === '303' || code === '309' || code === '329') return 67; // rain/sleet/snow
      return 61; // slight/moderate rain
    case '400': // 雪系
      if (code === '405' || code === '406' || code === '407') return 75; // heavy snow
      if (code === '403' || code === '409') return 67; // snow & rain
      return 71; // snow fall
    default:
      return 800;
  }
}

/** JMA 3桁天気コード → 日本語テロップ（気象庁公式名称またはフォールバック） */
export function codeToTelop(code: string): string {
  const entry = JMA_TELOPS[code];
  if (entry?.[3]) {
    // 公式名称の表記揺れ（例: "晴" → "晴れ"、"曇" → "曇り"、"晴時々曇" → "晴れ時々曇り"）を自然な日本語に調整
    const name = entry[3];
    if (name === '晴') return '晴れ';
    if (name === '曇') return '曇り';
    if (name === '雨') return '雨';
    if (name === '雪') return '雪';
    return name
      .replace(/晴(?!れ)/g, '晴れ')
      .replace(/曇(?!り)/g, '曇り')
      .replace(/後/g, 'のち');
  }
  return '';
}

/** JMA 3桁天気コード → アイコン分類（sun | partly | cloud | rain | snow | thunder） */
export function iconCategory(code: string): string {
  if (isThunder(code)) return 'thunder';

  const base = getBaseCode(code);
  if (base === '400') return 'snow';
  if (base === '300') return 'rain';

  if (isPartlyCloudy(code)) return 'partly';
  if (base === '100') return 'sun';
  return 'cloud';
}

/** 天気コード → OWM風 description（英語） */
export function owmDescription(code: string): string {
  const entry = JMA_TELOPS[code];
  if (entry?.[4]) return entry[4].toLowerCase();

  if (isThunder(code)) return 'thunderstorm';
  const base = getBaseCode(code);
  switch (base) {
    case '100':
      return isPartlyCloudy(code) ? 'partly cloudy' : 'clear sky';
    case '200':
      return isPartlyCloudy(code) ? 'scattered clouds' : 'overcast clouds';
    case '300':
      return 'moderate rain';
    case '400':
      return 'light snow';
    default:
      return 'overcast clouds';
  }
}

/** 天気コード → OWM風 main */
export function owmMain(code: string): string {
  if (isThunder(code)) return 'Thunderstorm';
  const base = getBaseCode(code);
  switch (base) {
    case '100':
      return 'Clear';
    case '200':
      return 'Clouds';
    case '300':
      return 'Rain';
    case '400':
      return 'Snow';
    default:
      return 'Clouds';
  }
}

/** 天気コード → OWM icon id (例: 01d) */
export function owmIcon(code: string): string {
  const map: Record<string, string> = {
    sun: '01',
    partly: '02',
    cloud: '03',
    rain: '10',
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
