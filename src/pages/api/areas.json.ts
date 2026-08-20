import type { APIRoute } from 'astro';
import { getOffices } from '../../lib/jma/client';
import { FORMATS, type FormatName } from '../../lib/transformers';

/** 全国の予報区（Office）一覧を静的JSONとして返す */
export const GET: APIRoute = async () => {
  const offices = await getOffices();
  const formats = Object.keys(FORMATS) as FormatName[];

  const data = {
    count: offices.length,
    formats,
    offices: offices.map((o) => ({
      id: o.code,
      name: o.name,
      region: o.region,
      url: formats.map(
        (f) => `/api/${f}/${o.code}.json`,
      ),
    })),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
