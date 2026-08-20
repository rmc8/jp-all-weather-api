import type { JmaNormalized } from '../jma/types';
import { num } from './helpers';

/** JMA 3桁天気コード → Visual Crossing conditions（英語） */
export function toVcConditions(code: string): string {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return code === '100' || code === '110' || code === '111'
        ? 'Clear'
        : 'Partially cloudy';
    case '2':
      return code === '201' || code === '210'
        ? 'Partially cloudy'
        : 'Overcast';
    case '3':
      return code === '303' ? 'Rain, Overcast' : 'Rain';
    case '4':
      return code === '403' ? 'Snow, Overcast' : 'Snow';
    case '5':
      return 'Thunderstorm';
    default:
      return 'Overcast';
  }
}

/**
 * Visual Crossing 互換（フラットで集計しやすい構造）へ変換する。
 * `days` 配列に日付ごとのオブジェクトを展開し、BI ツールやスプレッドシートへ
 * そのまま流し込みやすい形にする。
 */
export function toVisualCrossing(n: JmaNormalized) {
  const first = n.forecast[0];
  return {
    queryCost: 1,
    latitude: null,
    longitude: null,
    resolvedAddress: `${n.areaName}, Japan`,
    address: n.officeCode,
    timezone: 'Asia/Tokyo',
    tzoffset: 9,
    description: first?.weather ?? '',
    days: n.forecast.map((f) => ({
      datetime: f.date,
      temp: num(f.tempMax),
      tempmax: num(f.tempMax),
      tempmin: num(f.tempMin),
      precipprob: num(f.pop),
      conditions: toVcConditions(f.weatherCode ?? ''),
      description: f.weather,
    })),
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      areaName: n.areaName,
      reportDatetime: n.reportDatetime,
      note: 'このデータは気象庁の公開情報を加工して作成しています。',
    },
  };
}
