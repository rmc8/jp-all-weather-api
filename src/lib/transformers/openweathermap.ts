import type { JmaNormalized } from '../jma/types';
import {
  c2k,
  num,
  owmDescription,
  owmIcon,
  owmMain,
  toWmo,
} from './helpers';

/**
 * OpenWeatherMap（Current Weather Data）互換形式へ変換する。
 * 仕様に合わせて気温はケルビンで出力する。
 */
export function toOpenWeatherMap(n: JmaNormalized) {
  const today = n.forecast[0];
  const code = today?.weatherCode ?? '';

  return {
    coord: { lon: null, lat: null },
    weather: [
      {
        id: toWmo(code),
        main: owmMain(code),
        description: today?.weather ?? '',
        icon: owmIcon(code),
      },
    ],
    base: 'jma-forecast',
    main: {
      temp: c2k(today?.tempMax ?? ''),
      feels_like: null,
      temp_min: c2k(today?.tempMin ?? ''),
      temp_max: c2k(today?.tempMax ?? ''),
      pressure: null,
      humidity: null,
    },
    visibility: null,
    wind: { speed: null, deg: null },
    clouds: { all: null },
    dt: Math.floor(Date.parse(n.reportDatetime) / 1000) || null,
    sys: {
      country: 'JP',
      sunrise: null,
      sunset: null,
    },
    timezone: 32400, // Asia/Tokyo (UTC+9)
    id: Number(n.officeCode) || 0,
    name: n.areaName,
    cod: 200,
    forecast: {
      forecastday: n.forecast.map((f) => ({
        date: f.date,
        temp: {
          min: c2k(f.tempMin ?? ''),
          max: c2k(f.tempMax ?? ''),
        },
        weather: [
          {
            id: toWmo(f.weatherCode),
            main: owmMain(f.weatherCode),
            description: f.weather,
            icon: owmIcon(f.weatherCode),
          },
        ],
        pop: num(f.pop),
      })),
    },
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      reportDatetime: n.reportDatetime,
      description: owmDescription(code),
      note: 'このデータは気象庁の公開情報を加工して作成しています。気温はケルビンです。',
    },
  };
}
