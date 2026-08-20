import type { APIRoute, GetStaticPaths } from 'astro';
import {
  getForecast,
  getOffices,
  getOverview,
  mapLimit,
} from '../../../lib/jma/client';
import { normalizeForecast } from '../../../lib/jma/normalize';
import { FORMATS, type FormatName } from '../../../lib/transformers';

const FORMAT_KEYS = Object.keys(FORMATS) as FormatName[];

/**
 * ビルド時に全国の予報区（約58）を取得し、4フォーマット × 各エリア の
 * 静的JSONを一括生成する。気象庁への同時アクセスは5に制限。
 * データが取得できない予報区はスキップしてビルドを継続する。
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const offices = await getOffices();

  const perOffice = await mapLimit(offices, 5, async (office) => {
    try {
      const [reports, overview] = await Promise.all([
        getForecast(office.code),
        getOverview(office.code),
      ]);
      if (!reports.length) return [];
      const norm = normalizeForecast(
        office.code,
        office.name,
        office.region,
        reports,
        overview,
      );
      return FORMAT_KEYS.map((format) => ({
        params: { format, area: office.code },
        props: { data: FORMATS[format].transform(norm) },
      }));
    } catch (e) {
      console.warn(`Skipping ${office.code} (${office.name}):`, e);
      return [];
    }
  });

  return perOffice.flat();
};

export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify(props.data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
