import type { JmaNormalized } from '../jma/types';
import { num } from './helpers';

/** 日付を ISO 8601 で表現（JST） */
function iso(date: string): string {
  return `${date}T00:00:00+09:00`;
}

/** 次営業日（+1日）。UTC 変換による日付ずれを避けるため YYYY-MM-DD を直接加算する */
function nextDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return dt.toISOString().slice(0, 10);
}

/**
 * Schema.org `WeatherForecast`（JSON-LD）形式へ変換する。
 * セマンティックWeb・検索エンジン・AIエージェント向けに、天候メタデータを
 * 構造化データとして表現する。`variableMeasured` は予報初日の観測値を記載し、
 * `forecast` には全日の予報を拡張プロパティとして保持する。
 */
export function toSchemaOrg(n: JmaNormalized) {
  const first = n.forecast[0];

  const variableMeasured = [
    first?.tempMax
      ? {
          '@type': 'PropertyValue',
          name: 'temperatureMax',
          value: num(first.tempMax),
          unitCode: 'CEL',
        }
      : null,
    first?.tempMin
      ? {
          '@type': 'PropertyValue',
          name: 'temperatureMin',
          value: num(first.tempMin),
          unitCode: 'CEL',
        }
      : null,
    first?.pop
      ? {
          '@type': 'PropertyValue',
          name: 'precipitationProbability',
          value: Number(first.pop) / 100,
          unitCode: 'P1',
        }
      : null,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'WeatherForecast',
    name: `${n.areaName}の天気予報`,
    description: first?.weather ?? '',
    weatherCondition: first?.weather ?? '',
    validFrom: n.reportDatetime || iso(first?.date ?? ''),
    validUntil: first ? iso(nextDate(first.date)) : undefined,
    location: {
      '@type': 'Place',
      name: n.areaName,
      address: {
        '@type': 'PostalAddress',
        addressRegion: n.officeName,
        addressCountry: 'JP',
      },
    },
    variableMeasured,
    forecast: n.forecast.map((f) => ({
      '@type': 'WeatherForecast',
      name: `${f.date} ${n.areaName}の天気予報`,
      date: f.date,
      description: f.weather,
      temperatureMax: num(f.tempMax ?? ''),
      temperatureMin: num(f.tempMin ?? ''),
      precipitationProbability: num(f.pop ?? ''),
    })),
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      reportDatetime: n.reportDatetime,
      note: 'このデータは気象庁の公開情報を加工して作成しています。',
    },
  };
}
