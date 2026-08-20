import type { JmaNormalized } from '../jma/types';
import { getBaseCode, isPartlyCloudy, isThunder, num } from './helpers';

/** JMA 3桁天気コード → Apple WeatherKit conditionCode */
export function toWeatherKitCondition(code: string): string {
  if (!code) return 'Cloudy';
  if (isThunder(code)) return 'Thunderstorms';

  const base = getBaseCode(code);
  switch (base) {
    case '100':
      return isPartlyCloudy(code) ? 'PartlyCloudy' : 'Clear';
    case '200':
      return isPartlyCloudy(code) ? 'PartlyCloudy' : 'Cloudy';
    case '300':
      return 'Rain';
    case '400':
      return 'Snow';
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
