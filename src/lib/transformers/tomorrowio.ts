import type { JmaNormalized } from '../jma/types';
import { num } from './helpers';

/**
 * JMA 3桁天気コード → Tomorrow.io weatherCode。
 * https://docs.tomorrow.io/reference/data-layers-weather-codes
 */
export function toTomorrowioCode(code: string): number {
  const c = (code || '')[0];
  switch (c) {
    case '1': // 晴系
      // 100/110/111/112 は晴れ中心 → Clear
      if (code === '100' || code === '110' || code === '111' || code === '112') {
        return 1000;
      }
      return 1101; // 晴れ時々曇り/雨 → Partly Cloudy
    case '2': // 曇系
      return code === '201' || code === '210' ? 1101 : 1001;
    case '3': // 雨系
      return code === '301' ? 4200 : 4001;
    case '4': // 雪系
      return code === '401' ? 5001 : 5000;
    case '5': // 雷系
      return 8000;
    default:
      return 1001;
  }
}

/**
 * Tomorrow.io 互換（タイムライン階層設計）へ変換する。
 * `data.timelines[].intervals[]` に日別の時系列データと `values` を整理する。
 */
export function toTomorrowIo(n: JmaNormalized) {
  const first = n.forecast[0];
  const startTime = n.reportDatetime || '';
  const intervals = n.forecast.map((f) => {
    const code = f.weatherCode ?? '';
    return {
      startTime: `${f.date}T00:00:00+09:00`,
      values: {
        weatherCode: toTomorrowioCode(code),
        temperature: num(f.tempMax),
        temperatureMin: num(f.tempMin),
        temperatureMax: num(f.tempMax),
        precipitationProbability: num(f.pop),
      },
    };
  });

  return {
    data: {
      timelines: [
        {
          timestep: '1d',
          startTime,
          endTime: intervals.length
            ? `${n.forecast[n.forecast.length - 1].date}T00:00:00+09:00`
            : startTime,
          intervals,
        },
      ],
    },
    location: {
      name: n.areaName,
      officeCode: n.officeCode,
      timezone: 'Asia/Tokyo',
      country: 'JP',
    },
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      reportDatetime: n.reportDatetime,
      description: first?.weather ?? '',
      note: 'このデータは気象庁の公開情報を加工して作成しています。',
    },
  };
}
