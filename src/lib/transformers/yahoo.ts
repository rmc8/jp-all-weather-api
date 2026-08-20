import type { JmaNormalized } from '../jma/types';

/** ISO 日時（JST）→ Yahoo! YOLP の日時形式（YYYYMMDDHHMM） */
export function toYahooDate(datetime: string): string {
  if (!datetime) return '';
  const d = new Date(datetime);
  if (Number.isNaN(d.getTime())) return '';
  const p = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(
    d.getHours(),
  )}${p(d.getMinutes())}`;
}

/**
 * Yahoo! JAPAN YOLP（気象情報API）互換形式へ変換する。
 * `Feature` 配列の中に観測（observation）・予報（Forecast）の WeatherList を格納する。
 * 気象庁のデータには降水量階級（Rainfall）が無いため、本APIでは "0" を返す。
 */
export function toYahoo(n: JmaNormalized) {
  const first = n.forecast[0];
  const baseDate = n.reportDatetime || `${first?.date ?? ''}T05:00:00+09:00`;

  const weather = [
    // 現在の観測（初日の予報を観測値として扱う）
    {
      Type: 'observation',
      Date: toYahooDate(baseDate),
      Weather: first?.weather ?? '',
      WeatherCode: first?.weatherCode ? Number(first.weatherCode) : null,
      Rainfall: '0',
    },
    // 日別予報
    ...n.forecast.map((f) => ({
      Type: 'Forecast',
      Date: toYahooDate(`${f.date}T05:00:00+09:00`),
      Weather: f.weather,
      WeatherCode: f.weatherCode ? Number(f.weatherCode) : null,
      Rainfall: '0',
    })),
  ];

  return {
    ResultInfo: {
      Count: 1,
      Status: 200,
    },
    Feature: [
      {
        Name: n.areaName,
        Property: {
          WeatherList: {
            Weather: weather,
          },
        },
      },
    ],
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      reportDatetime: n.reportDatetime,
      note: 'このデータは気象庁の公開情報を加工して作成しています。降水量階級(Rainfall)は気象庁データに無いため "0" を返します。',
    },
  };
}
