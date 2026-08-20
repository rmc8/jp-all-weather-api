import type {
  JmaDay,
  JmaNormalized,
  JmaOverview,
  JmaReport,
} from './types';
import { codeToTelop } from '../transformers/helpers';

/** 全角・連続空白を整理して見やすくする */
export function cleanWeather(s: string): string {
  return (s || '').replace(/\s+/g, ' ').trim();
}

/** 予報日時(reportDatetime)を基準に 今日/明日/明後日/日付 を算出 */
export function dateLabel(dateStr: string, reportDatetime: string): string {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  const base = new Date(reportDatetime);
  const diff = Math.round((d.getTime() - base.getTime()) / 86_400_000);
  if (diff <= 0) return '今日';
  if (diff === 1) return '明日';
  if (diff === 2) return '明後日';
  const wd = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${wd})`;
}

/**
 * 気象庁の予報レポート群を、全フォーマット共通の中間モデルへ正規化する。
 *
 * - 複数レポート（短期的 report[0] と 週間 report[1]）を日付単位でマージ。
 *   先に見つかった値（新しい/詳細な短期的予報）を優先する。
 * - 週間予報には日本語テロップ(weathers)が無いため、天気コードから
 *   codeToTelop() で導出する。
 * - 短期的予報の temps 配列から「今日の最高気温」を補完する。
 */
export function normalizeForecast(
  officeCode: string,
  officeName: string,
  regionName: string,
  reports: JmaReport[],
  overview: JmaOverview | null,
): JmaNormalized {
  const list = reports.filter(Boolean);
  const latest = list[0];

  // 日付 → 部分データ
  const merged = new Map<string, Partial<JmaDay>>();
  const order: string[] = [];
  const seen = new Set<string>();

  for (const report of list) {
    for (const ts of report.timeSeries ?? []) {
      const a = ts.areas?.[0];
      if (!a) continue;
      ts.timeDefines.forEach((time, i) => {
        const date = time.slice(0, 10);
        if (!seen.has(date)) {
          seen.add(date);
          order.push(date);
        }
        const d = merged.get(date) ?? {};
        if (a.weathers?.[i] && !d.weather) d.weather = cleanWeather(a.weathers[i]);
        if (a.weatherCodes?.[i] && !d.weatherCode) d.weatherCode = a.weatherCodes[i];
        if (a.pops?.[i] && !d.pop) d.pop = a.pops[i];
        if (a.tempsMin?.[i] && !d.tempMin) d.tempMin = a.tempsMin[i];
        if (a.tempsMax?.[i] && !d.tempMax) d.tempMax = a.tempsMax[i];
        merged.set(date, d);
      });
    }
  }

  // 短期的予報 report[0] の temps 配列から「今日の最高気温」を補完
  const short = list[0];
  const tempSeries = short?.timeSeries.find((ts) => ts.areas[0]?.temps);
  if (tempSeries) {
    const a = tempSeries.areas[0];
    const todayDate = tempSeries.timeDefines[0]?.slice(0, 10);
    if (todayDate && a.temps?.[0] && !merged.get(todayDate)?.tempMax) {
      const d = merged.get(todayDate) ?? {};
      d.tempMax = a.temps[0];
      merged.set(todayDate, d);
    }
  }

  const areaName =
    list
      .flatMap((r) => r.timeSeries)
      .find((ts) => ts.areas[0]?.weathers || ts.areas[0]?.weatherCodes)
      ?.areas[0]?.area?.name ?? officeName;

  const reportDt =
    latest?.reportDatetime ?? overview?.reportDatetime ?? '';

  const forecast: JmaDay[] = order.map((date) => {
    const d = merged.get(date) ?? {};
    const weather =
      d.weather || (d.weatherCode ? codeToTelop(d.weatherCode) : '');
    return {
      date,
      dateLabel: dateLabel(date, reportDt || date),
      weather,
      weatherCode: d.weatherCode ?? '',
      tempMin: d.tempMin ?? null,
      tempMax: d.tempMax ?? null,
      pop: d.pop ?? null,
    };
  });

  return {
    officeCode,
    officeName,
    regionName,
    areaName,
    publishingOffice: latest?.publishingOffice ?? '気象庁',
    reportDatetime: reportDt,
    overviewText: overview?.text ?? '',
    overviewDatetime: overview?.reportDatetime ?? reportDt,
    forecast,
  };
}
