import type { JmaNormalized } from '../jma/types';
import { getCoordinates } from './coordinates';
import { num } from './helpers';

/** JMA 3桁天気コード → Dark Sky icon */
export function toDarkSkyIcon(code: string): string {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return code === '100' || code === '110' || code === '111' || code === '112'
        ? 'clear-day'
        : 'partly-cloudy-day';
    case '2':
      return code === '201' || code === '210' ? 'partly-cloudy-day' : 'cloudy';
    case '3':
      return 'rain';
    case '4':
      return 'snow';
    case '5':
      return 'thunderstorm';
    default:
      return 'cloudy';
  }
}

/**
 * Dark Sky / Pirate Weather 互換形式へ変換する。
 * Home Assistant などの IoT プラットフォームで広く使われる `currently` / `daily`
 * の階層構造を持つ。気温は摂氏、`precipProbability` は 0〜1 の確率で表現する。
 */
export function toDarkSky(n: JmaNormalized) {
  const coord = getCoordinates(n.officeCode);
  const first = n.forecast[0];
  const epoch = (d: string) => Math.floor(Date.parse(`${d}T00:00:00+09:00`) / 1000) || null;

  return {
    latitude: coord?.lat ?? null,
    longitude: coord?.lon ?? null,
    timezone: 'Asia/Tokyo',
    offset: 9,
    currently: {
      time: epoch(first?.date ?? ''),
      summary: first?.weather ?? '',
      icon: toDarkSkyIcon(first?.weatherCode ?? ''),
      temperature: num(first?.tempMax ?? ''),
      humidity: null,
    },
    daily: {
      summary: n.overviewText || first?.weather || '',
      data: n.forecast.map((f) => ({
        time: epoch(f.date),
        summary: f.weather,
        icon: toDarkSkyIcon(f.weatherCode ?? ''),
        temperatureHigh: num(f.tempMax ?? ''),
        temperatureLow: num(f.tempMin ?? ''),
        precipProbability:
          f.pop === null || f.pop === '' ? null : Number(f.pop) / 100,
      })),
    },
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
