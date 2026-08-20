import type { JmaNormalized } from '../jma/types';
import { toLivedoor } from './livedoor';
import { toWeatherApi } from './weatherapi';
import { toOpenWeatherMap } from './openweathermap';
import { toOpenMeteo } from './openmeteo';
import { toTomorrowIo } from './tomorrowio';
import { toVisualCrossing } from './visualcrossing';
import { toAccuWeather } from './accuweather';
import { toGeoJson } from './geojson';
import { toDarkSky } from './darksky';
import { toWeatherKit } from './weatherkit';
import { toSchemaOrg } from './schemaorg';
import { toYahoo } from './yahoo';

export type FormatName =
  | 'livedoor'
  | 'weatherapi'
  | 'openweathermap'
  | 'open-meteo'
  | 'tomorrowio'
  | 'visualcrossing'
  | 'accuweather'
  | 'geojson'
  | 'darksky'
  | 'weatherkit'
  | 'schemaorg'
  | 'yahoo';

export interface FormatInfo {
  label: string;
  description: string;
  transform: (n: JmaNormalized) => unknown;
}

export const FORMATS: Record<FormatName, FormatInfo> = {
  livedoor: {
    label: 'Livedoor天気API',
    description: 'かつての Weather Hacks 互換形式（日本語・日付ラベル付き）',
    transform: toLivedoor,
  },
  weatherapi: {
    label: 'WeatherAPI.com',
    description: '単位付きキー・直感的な階層（AIエージェント向け）',
    transform: toWeatherApi,
  },
  openweathermap: {
    label: 'OpenWeatherMap',
    description: '業界標準の Current Weather 形式（気温はケルビン）',
    transform: toOpenWeatherMap,
  },
  'open-meteo': {
    label: 'Open-Meteo',
    description: 'カラム指向・時系列配列（グラフ/分析向け）',
    transform: toOpenMeteo,
  },
  tomorrowio: {
    label: 'Tomorrow.io',
    description: 'タイムライン階層設計（`timelines` の `intervals` に時系列データ）',
    transform: toTomorrowIo,
  },
  visualcrossing: {
    label: 'Visual Crossing',
    description: 'フラットな配列構造（BI・データ分析向け）',
    transform: toVisualCrossing,
  },
  accuweather: {
    label: 'AccuWeather',
    description: 'Day/Night 分離・インデックス構造（組み込みアプリ向け）',
    transform: toAccuWeather,
  },
  geojson: {
    label: 'GeoJSON (RFC 7946)',
    description: '地図可視化・GIS 連携向けの FeatureCollection',
    transform: toGeoJson,
  },
  darksky: {
    label: 'Dark Sky / Pirate Weather',
    description: 'OSS・スマートホーム（Home Assistant 等）互換の `currently` / `daily` 階層',
    transform: toDarkSky,
  },
  weatherkit: {
    label: 'Apple WeatherKit',
    description: 'Apple エコシステム向け（`currentWeather` / `forecastDaily`）',
    transform: toWeatherKit,
  },
  schemaorg: {
    label: 'Schema.org (JSON-LD)',
    description: 'セマンティックWeb・AIエージェント向けの構造化データ',
    transform: toSchemaOrg,
  },
  yahoo: {
    label: 'Yahoo! JAPAN YOLP',
    description: '国内標準仕様（Feature 配列内の WeatherList）',
    transform: toYahoo,
  },
};

export function transform(format: FormatName, norm: JmaNormalized): unknown {
  return FORMATS[format].transform(norm);
}
