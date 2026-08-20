import type { JmaNormalized } from '../jma/types';
import { num } from './helpers';

/** JMA 3桁天気コード → Apple WeatherKit conditionCode */
export function toWeatherKitCondition(code: string): string {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return code === '100' || code === '110' || code === '111' || code === '112'
        ? 'Clear'
        : 'PartlyCloudy';
    case '2':
      return code === '201' || code === '210' ? 'PartlyCloudy' : 'Cloudy';
    case '3':
      return 'Rain';
    case '4':
      return 'Snow';
    case '5':
      return 'Thunderstorms';
    default:
      return 'Cloudy';
  }
}

/**
 * Apple WeatherKit 互換形式へ変換する。
 * `currentWeather` / `forecastDaily` のようにデータセットごとに独立した
 * オブジェクトを持つモダンな設計。気温は摂氏、`precipitationChance` は 0〜1。
 */
export function toWeatherKit(n: JmaNormalized) {
  const first = n.forecast[0];
  const asOf =
    n.reportDatetime || `${first?.date ?? ''}T00:00:00+09:00`;

  return {
    currentWeather: {
      asOf,
      conditionCode: toWeatherKitCondition(first?.weatherCode ?? ''),
      temperature: num(first?.tempMax ?? ''),
      humidity: null,
      cloudCover: null,
    },
    forecastDaily: {
      days: n.forecast.map((f) => ({
        forecastStart: `${f.date}T00:00:00Z`,
        conditionCode: toWeatherKitCondition(f.weatherCode ?? ''),
        temperatureMax: num(f.tempMax ?? ''),
        temperatureMin: num(f.tempMin ?? ''),
        precipitationChance:
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
