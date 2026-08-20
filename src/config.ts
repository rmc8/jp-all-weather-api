/**
 * サイト全体の設定。
 * デプロイ先に合わせて環境変数 `PUBLIC_API_BASE` で上書きできます。
 *
 * 例:
 *   PUBLIC_API_BASE=https://weather.rmc-8.com pnpm build
 *   # または .env に PUBLIC_API_BASE=... と記述
 */
export const API_BASE: string =
  import.meta.env.PUBLIC_API_BASE ?? "https://weather.rmc-8.com";

/** API ルート（末尾スラッシュなし） */
export const API_ROOT: string = `${API_BASE}/api`;

/** エリア一覧エンドポイント */
export const AREAS_URL: string = `${API_ROOT}/areas.json`;

/** 指定フォーマット・予報区の天気JSON URL */
export function weatherUrl(format: string, area: string): string {
  return `${API_ROOT}/${format}/${area}.json`;
}
