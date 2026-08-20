import type { JmaNormalized } from '../jma/types';
import { getCoordinates } from './coordinates';
import { num } from './helpers';

/** 単一の予報区を Point Feature 化する。全国集約（japan.json）でも再利用する。 */
export function toGeoJsonFeature(n: JmaNormalized) {
  const first = n.forecast[0];
  const coord = getCoordinates(n.officeCode);

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coord ? [coord.lon, coord.lat] : null,
    },
    properties: {
      areaCode: n.officeCode,
      name: n.areaName,
      prefecture: n.officeName,
      region: n.regionName,
      telop: first?.weather ?? '',
      weatherCode: first?.weatherCode ?? '',
      tempMax: num(first?.tempMax ?? ''),
      tempMin: num(first?.tempMin ?? ''),
      pop: num(first?.pop ?? ''),
      reportDatetime: n.reportDatetime,
    },
  };
}

/**
 * GeoJSON（RFC 7946）互換形式へ変換する。
 * 各予報区を Point Feature として表現し、地図ライブラリ（Leaflet / MapLibre GL JS /
 * Kepler.gl など）へそのまま渡せる FeatureCollection を生成する。
 * 座標は `coordinates.ts` に固定値として組み込んだ観測地の緯度経度を使用する。
 */
export function toGeoJson(n: JmaNormalized) {
  return {
    type: 'FeatureCollection',
    name: n.areaName,
    features: [toGeoJsonFeature(n)],
    source: {
      provider: '気象庁',
      officeCode: n.officeCode,
      officeName: n.officeName,
      note: 'このデータは気象庁の公開情報を加工して作成しています。座標は代表観測地の固定値です。',
    },
  };
}
