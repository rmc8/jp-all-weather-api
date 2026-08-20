import type { JmaAreaMaster, JmaOverview, JmaReport } from './types';

const JMA_BASE = 'https://www.jma.go.jp/bosai';
const USER_AGENT =
  'jp-all-weather-api/1.0 (+https://github.com/rmc8/jp-all-weather-api)';

/**
 * JSON をフェッチする。ネットワークエラー / 5xx 時は指数バックオフでリトライ。
 */
export async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return (await res.json()) as T;
    } catch (e) {
      lastError = e;
      const wait = 400 * 2 ** attempt;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to fetch ${url}`);
}

let areaMasterCache: JmaAreaMaster | null = null;

/** 全国のエリアマスタを取得（ビルド内でキャッシュ） */
export async function getAreaMaster(): Promise<JmaAreaMaster> {
  if (!areaMasterCache) {
    areaMasterCache = await fetchJson<JmaAreaMaster>(
      `${JMA_BASE}/common/const/area.json`,
    );
  }
  return areaMasterCache;
}

export interface Office {
  code: string;
  name: string;
  region: string;
}

/** 約58の予報区（Office）一覧を地方名つきで返す */
export async function getOffices(): Promise<Office[]> {
  const master = await getAreaMaster();
  return Object.entries(master.offices).map(([code, info]) => {
    const region = info.parent ? master.centers[info.parent]?.name ?? '' : '';
    return { code, name: info.name, region };
  });
}

/** 指定予報区の天気予報（短期的 + 週間） */
export async function getForecast(officeCode: string): Promise<JmaReport[]> {
  return fetchJson<JmaReport[]>(
    `${JMA_BASE}/forecast/data/forecast/${officeCode}.json`,
  );
}

/** 指定予報区の天気概況（説明文）。失敗時は null */
export async function getOverview(
  officeCode: string,
): Promise<JmaOverview | null> {
  try {
    return await fetchJson<JmaOverview>(
      `${JMA_BASE}/forecast/data/overview_forecast/${officeCode}.json`,
    );
  } catch {
    return null;
  }
}

/** 同時実行数を制限した map 実装（気象庁への負荷を抑えるため） */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
