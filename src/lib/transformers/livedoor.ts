import type { JmaNormalized } from '../jma/types';
import { c2f, iconCategory, popObject } from './helpers';

/**
 * Livedoor天気API（Weather Hacks）互換形式へ変換する。
 * データソースは気象庁のため、provider には気象庁を明記する。
 */
export function toLivedoor(n: JmaNormalized) {
  const id = n.officeCode;
  const url = `https://www.jma.go.jp/jp/weather/forecast/`;
  const title = `${n.officeName} ${n.areaName} の天気`;

  return {
    pinpoint: [{ link: url, title: `${n.areaName} ${n.officeName}` }],
    link: url,
    forecasts: n.forecast.slice(0, 3).map((f) => ({
      date: f.date,
      dateLabel: f.dateLabel,
      telop: f.weather,
      temperature: {
        min: f.tempMin
          ? { celsius: f.tempMin, fahrenheit: c2f(f.tempMin) }
          : null,
        max: f.tempMax
          ? { celsius: f.tempMax, fahrenheit: c2f(f.tempMax) }
          : null,
      },
      image: {
        title: f.weather,
        url: `/icons/${iconCategory(f.weatherCode)}.svg`,
        width: 50,
        height: 50,
      },
      chanceOfRain: popObject(f.pop),
    })),
    location: {
      area: n.regionName,
      pref: n.officeName,
      city: n.areaName,
      id,
    },
    publicTime: n.reportDatetime,
    copyright: {
      provider: [{ link: 'https://www.jma.go.jp/', title: '気象庁' }],
      image: {
        title: '気象庁 天気予報',
        link: 'https://www.jma.go.jp/',
        url: '/icons/cloud.svg',
        width: 50,
        height: 50,
      },
      comment:
        'このAPIの天気データは、気象庁が公開する情報を加工して作成しています。',
    },
    title,
    description: {
      text: n.overviewText,
      publicTime: n.overviewDatetime,
    },
  };
}
