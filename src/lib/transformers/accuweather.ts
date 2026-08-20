import type { JmaNormalized } from '../jma/types';
import { num } from './helpers';

/** JMA 3桁天気コード → AccuWeather Icon 番号 */
export function toAccuWeatherIcon(code: string): number {
  const c = (code || '')[0];
  switch (c) {
    case '1':
      return code === '100' || code === '110' || code === '111'
        ? 1 // Sunny
        : 3; // Partly Sunny
    case '2':
      return code === '201' || code === '210' ? 3 : 7; // Cloudy
    case '3':
      return code === '303' ? 18 : 12; // Rain / Showers
    case '4':
      return code === '403' ? 22 : 19; // Snow / Flurries
    case '5':
      return 15; // Thunderstorms
    default:
      return 7;
  }
}

/**
 * AccuWeather 互換（昼夜分割・インデックス構造）へ変換する。
 * 1日の予報を `Day` / `Night` に分けて表現する（気象庁の日単位予報のため
 * 昼夜は同じテロップ・降水確率を使用する）。
 */
export function toAccuWeather(n: JmaNormalized) {
  const first = n.forecast[0];

  return {
    Headline: {
      EffectiveDate: n.reportDatetime,
      EffectiveEpochDate: Math.floor(Date.parse(n.reportDatetime) / 1000) || null,
      Severity: 0,
      Text: first?.weather ?? '',
      Category: '',
    },
    DailyForecasts: n.forecast.map((f) => {
      const code = f.weatherCode ?? '';
      const pop = num(f.pop);
      return {
        Date: `${f.date}T07:00:00+09:00`,
        EpochDate: Math.floor(Date.parse(`${f.date}T00:00:00+09:00`) / 1000) || null,
        Temperature: {
          Minimum: { Value: num(f.tempMin), Unit: 'C', UnitType: 17 },
          Maximum: { Value: num(f.tempMax), Unit: 'C', UnitType: 17 },
        },
        Day: {
          Icon: toAccuWeatherIcon(code),
          IconPhrase: f.weather,
          HasPrecipitation: (pop ?? 0) > 0,
          PrecipitationProbability: pop,
        },
        Night: {
          Icon: toAccuWeatherIcon(code),
          IconPhrase: f.weather,
          HasPrecipitation: (pop ?? 0) > 0,
          PrecipitationProbability: pop,
        },
      };
    }),
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
