import type { JmaNormalized } from '../jma/types';
import { c2f, iconCategory, num, owmDescription, toWmo } from './helpers';

/**
 * WeatherAPI.com 互換形式へ変換する。
 * キー名に単位が明記され、AI エージェントが扱いやすい階層構造。
 */
export function toWeatherApi(n: JmaNormalized) {
  const today = n.forecast[0];
  const iconUrl = (code: string) =>
    `/icons/${iconCategory(code)}.svg`;

  return {
    location: {
      name: n.areaName,
      region: n.officeName,
      country: 'Japan',
      lat: null,
      lon: null,
      tz_id: 'Asia/Tokyo',
      localtime: n.reportDatetime,
    },
    current: {
      last_updated: n.reportDatetime,
      temp_c: today?.tempMax ? num(today.tempMax) : null,
      temp_f: today?.tempMax ? Number(c2f(today.tempMax)) : null,
      is_day: 1,
      condition: {
        text: today?.weather ?? '',
        icon: today ? iconUrl(today.weatherCode) : '/icons/cloud.svg',
        code: today ? toWmo(today.weatherCode) : 800,
      },
      wind_kph: null,
      wind_dir: null,
      pressure_mb: null,
      humidity: null,
      uv: null,
    },
    forecast: {
      forecastday: n.forecast.map((f) => ({
        date: f.date,
        day: {
          maxtemp_c: num(f.tempMax),
          maxtemp_f: f.tempMax ? Number(c2f(f.tempMax)) : null,
          mintemp_c: num(f.tempMin),
          mintemp_f: f.tempMin ? Number(c2f(f.tempMin)) : null,
          daily_chance_of_rain: num(f.pop),
          condition: {
            text: f.weather,
            icon: iconUrl(f.weatherCode),
            code: toWmo(f.weatherCode),
          },
        },
      })),
    },
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      reportDatetime: n.reportDatetime,
      description: owmDescription(today?.weatherCode ?? ''),
      note: 'このデータは気象庁の公開情報を加工して作成しています。',
    },
  };
}
