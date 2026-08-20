import type { JmaNormalized } from '../jma/types';
import { num, toWmo } from './helpers';

/**
 * Open-Meteo 互換形式（カラム指向・時系列配列）へ変換する。
 * 日時配列と各気象要素配列のインデックスが同期する設計。
 */
export function toOpenMeteo(n: JmaNormalized) {
  return {
    latitude: null,
    longitude: null,
    timezone: 'Asia/Tokyo',
    timezone_abbreviation: 'JST',
    elevation: null,
    daily: {
      time: n.forecast.map((f) => f.date),
      weather_code: n.forecast.map((f) => toWmo(f.weatherCode)),
      temperature_2m_max: n.forecast.map((f) => num(f.tempMax)),
      temperature_2m_min: n.forecast.map((f) => num(f.tempMin)),
      precipitation_probability_max: n.forecast.map((f) => num(f.pop)),
    },
    daily_units: {
      time: 'ISO8601',
      weather_code: 'wmo code',
      temperature_2m_max: '°C',
      temperature_2m_min: '°C',
      precipitation_probability_max: '%',
    },
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      reportDatetime: n.reportDatetime,
      note: 'このデータは気象庁の公開情報を加工して作成しています。',
    },
  };
}
