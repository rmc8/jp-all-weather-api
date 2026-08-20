import type { APIRoute } from 'astro';
import {
  getForecast,
  getOffices,
  getOverview,
  mapLimit,
} from '../../../lib/jma/client';
import { normalizeForecast } from '../../../lib/jma/normalize';
import { toGeoJsonFeature } from '../../../lib/transformers/geojson';

/**
 * 全国の予報区を1つの FeatureCollection に集約した GeoJSON を返す。
 * Leaflet / MapLibre GL JS / Kepler.gl などへそのまま渡して、
 * 日本地図上に全国の天気ピンを一括描画できる。
 */
export const GET: APIRoute = async () => {
  const offices = await getOffices();

  const features = await mapLimit(offices, 5, async (office) => {
    try {
      const [reports, overview] = await Promise.all([
        getForecast(office.code),
        getOverview(office.code),
      ]);
      if (!reports.length) return null;
      const norm = normalizeForecast(
        office.code,
        office.name,
        office.region,
        reports,
        overview,
      );
      return toGeoJsonFeature(norm);
    } catch (e) {
      console.warn(`Skipping ${office.code} (${office.name}):`, e);
      return null;
    }
  });

  const data = {
    type: 'FeatureCollection',
    name: 'Japan All Weather',
    features: features.filter(Boolean),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
