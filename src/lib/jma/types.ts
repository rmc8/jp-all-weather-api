/**
 * 気象庁(JMA) 予報JSON および エリアマスタの型定義
 */

export interface JmaArea {
  name: string;
  code?: string;
  enName?: string;
  officeName?: string;
  parent?: string;
  children?: string[];
  kana?: string;
}

/** https://www.jma.go.jp/bosai/common/const/area.json */
export interface JmaAreaMaster {
  centers: Record<string, JmaArea>;
  offices: Record<string, JmaArea>;
  class10s: Record<string, JmaArea>;
  class15s: Record<string, JmaArea>;
  class20s: Record<string, JmaArea>;
}

export interface JmaForecastArea {
  area: JmaArea;
  weatherCodes?: string[];
  weathers?: string[];
  winds?: string[];
  waves?: string[];
  pops?: string[];
  reliabilities?: string[];
  temps?: string[];
  tempsMin?: string[];
  tempsMax?: string[];
  tempsMinUpper?: string[];
  tempsMinLower?: string[];
  tempsMaxUpper?: string[];
  tempsMaxLower?: string[];
}

export interface JmaTimeSeries {
  timeDefines: string[];
  areas: JmaForecastArea[];
}

/** forecast/{code}.json の1要素（1発表単位） */
export interface JmaReport {
  publishingOffice: string;
  reportDatetime: string;
  targetArea?: string;
  headlineText?: string;
  text?: string;
  timeSeries: JmaTimeSeries[];
  tempAverage?: Record<string, string | number>;
  precipAverage?: Record<string, string | number>;
}

/** overview_forecast/{code}.json */
export interface JmaOverview {
  publishingOffice: string;
  reportDatetime: string;
  targetArea: string;
  headlineText?: string;
  text?: string;
}

/** 全フォーマット共通の中間正規化モデル */
export interface JmaDay {
  date: string; // YYYY-MM-DD
  dateLabel: string; // 今日 / 明日 / 明後日 / M/D(曜)
  weather: string; // 例: 晴れ
  weatherCode: string; // JMA 3桁コード
  tempMin: string | null;
  tempMax: string | null;
  pop: string | null; // 降水確率(%)
}

export interface JmaNormalized {
  officeCode: string; // 予報区コード (例: 130000)
  officeName: string; // 予報区名 (例: 東京都)
  regionName: string; // 地方名 (例: 関東甲信)
  areaName: string; // 一次細分区域名 (例: 東京地方)
  publishingOffice: string;
  reportDatetime: string;
  overviewText: string;
  overviewDatetime: string;
  forecast: JmaDay[];
}
