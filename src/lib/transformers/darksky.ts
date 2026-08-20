import type { JmaNormalized } from '../jma/types';
import { getCoordinates } from './coordinates';
import { getBaseCode, isPartlyCloudy, isThunder, num } from './helpers';

/** JMA 3桁天気コード → Dark Sky icon */
export function toDarkSkyIcon(code: string): string {
  if (!code) return 'cloudy';
  if (isThunder(code)) return 'thunderstorm';

  const base = getBaseCode(code);
  switch (base) {
    case '100':
      return isPartlyCloudy(code) ? 'partly-cloudy-day' : 'clear-day';
    case '200':
      return isPartlyCloudy(code) ? 'partly-cloudy-day' : 'cloudy';
    case '300':
      return 'rain';
    case '400':
      return 'snow';
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
