# JP All Weather API

気象庁(JMA)が公開する天気予報データを、**12種類のJSONフォーマット**へ変換して配信する天気APIです。

全国の予報区（約58箇所）をカバーし、ビルド時に静的JSONとして一括生成する**SSG（Static Site Generation）**方式のため、サーバー不要・高負荷耐性があります。

## 対応フォーマット

| フォーマット     | パス                              | 特徴                             |
| ---------------- | --------------------------------- | -------------------------------- |
| Livedoor天気API  | `/api/livedoor/{area}.json`       | 日本語テロップ・日付ラベル付き   |
| WeatherAPI.com   | `/api/weatherapi/{area}.json`     | 単位付きキー・AIエージェント向け |
| OpenWeatherMap   | `/api/openweathermap/{area}.json` | 業界標準形式（気温はケルビン）   |
| Open-Meteo       | `/api/open-meteo/{area}.json`     | カラム指向・時系列配列           |
| Tomorrow.io      | `/api/tomorrowio/{area}.json`     | タイムライン階層（AI向け）       |
| Visual Crossing  | `/api/visualcrossing/{area}.json` | フラット配列（BI・分析向け）     |
| AccuWeather      | `/api/accuweather/{area}.json`    | Day/Night 分離・組み込み向け     |
| GeoJSON          | `/api/geojson/{area}.json`        | 地図可視化（RFC 7946）           |
| Dark Sky         | `/api/darksky/{area}.json`        | OSS・スマートホーム互換          |
| Apple WeatherKit | `/api/weatherkit/{area}.json`     | Apple エコシステム向け           |
| Schema.org       | `/api/schemaorg/{area}.json`      | セマンティックWeb・AI向け        |
| Yahoo! JAPAN     | `/api/yahoo/{area}.json`          | 国内標準仕様（YOLP互換）         |

## 技術スタック

- [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/)（ドキュメント）
- [Starwind UI](https://starwind.dev/)（Astro ネイティブの shadcn 風 UI・Tailwind v4）
- [Fontsource](https://fontsource.org/) 自己ホストフォント（Noto Sans JP + Noto Sans Mono）
- データソース: 気象庁（[`bosai/forecast`](https://www.jma.go.jp/bosai/forecast/) 公開JSON）
- パッケージ管理: [pnpm](https://pnpm.io/)

> サイトの見た目（ヘッダー・フッター・テーマ切替・目次トグルなど）は [`src/components/Overrides/`](src/components/Overrides/) の Starlight コンポーネント・オーバーライドでカスタマイズしています。配色・余白は [`src/styles/global.css`](src/styles/global.css) と [`src/styles/starwind.css`](src/styles/starwind.css) で調整できます。

## クイックスタート

### インストール & 起動

```sh
pnpm install
pnpm build   # 全予報区 × 12形式 の静的JSONとドキュメントを生成
pnpm preview # ビルド結果を http://localhost:4321/ で配信
```

開発中は `pnpm dev` でホットリロードを利用できます。

### 天気の取得例

```sh
# エリア一覧
curl https://weather.rmc-8.com/api/areas.json

# 東京都(130000)の天気を Livedoor 形式で取得
curl https://weather.rmc-8.com/api/livedoor/130000.json

# 大阪府(270000)の天気を WeatherAPI.com 形式で取得
curl https://weather.rmc-8.com/api/weatherapi/270000.json

# 全国の天気を GeoJSON（地図可視化用）で取得
curl https://weather.rmc-8.com/api/geojson/japan.json
```

### API ベースURLの設定

ベースURLは [`src/config.ts`](src/config.ts) の `API_BASE` で定義され、環境変数 `PUBLIC_API_BASE` で上書きできます。デフォルトは `https://weather.rmc-8.com` です。

```sh
PUBLIC_API_BASE=https://example.com pnpm build   # または .env に記述
```

## ドキュメント

[Starlight](https://starlight.astro.build/) で構築したドキュメントがルートに配置されています。

- ホーム（天気デモ・フォーマット紹介）: `/`
- クイックスタート: `/guides/quickstart/`
- 対応フォーマット: `/guides/formats/`
- 天気API リファレンス: `/reference/weather-api/`
- エリア一覧: `/reference/areas/`
- レスポンス形式: `/reference/response-format/`

## アーキテクチャ

```
src/
├── lib/
│   ├── jma/                  # 気象庁 API クライアント・正規化
│   │   ├── client.ts         #   フェッチ・エリアマスタ・並列制御
│   │   ├── normalize.ts      #   共通中間モデルへの正規化
│   │   └── types.ts
│   └── transformers/         # 12フォーマットへの変換
│       ├── livedoor.ts
│       ├── weatherapi.ts
│       ├── openweathermap.ts
│       ├── openmeteo.ts
│       ├── tomorrowio.ts
│       ├── visualcrossing.ts
│       ├── accuweather.ts
│       ├── geojson.ts
│       ├── darksky.ts
│       ├── weatherkit.ts
│       ├── schemaorg.ts
│       ├── yahoo.ts
│       ├── coordinates.ts    # 予報区→緯度経度（GeoJSON用）
│       └── helpers.ts        # 天気コード→WMO/アイコン、温度換算
├── pages/
│   └── api/
│       ├── [format]/[area].json.ts   # ビルド時に全エリア生成
│       ├── areas.json.ts             # 予報区一覧
│       └── geojson/japan.json.ts     # 全国の FeatureCollection
└── content/docs/             # Starlight ドキュメント
```

- ビルド時、[`getStaticPaths`](src/pages/api/[format]/[area].json.ts) が全予報区のデータを取得して静的JSONを生成します。
- 気象庁への同時アクセス数は5に制限し、`User-Agent` を明記・リトライ付きでアクセスしています。

## デプロイ

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) が用意されており、以下のタイミングで自動ビルド＆デプロイします。

- `main` ブランチへの push
- 手動実行（workflow_dispatch）
- **1日3回の定期実行**（気象庁の更新 5時・11時・17時 JST の直後）

### 設定手順

1. [`astro.config.mjs`](astro.config.mjs) の `site` / `base` をデプロイ先のURLに合わせて変更してください。

   ```js
   // サブドメイン（例: weather.rmc-8.com）の場合
   site: 'https://weather.rmc-8.com',
   base: '/',

   // プロジェクトページ（例: GitHub Pages）の場合
   site: 'https://<ユーザー名>.github.io',
   base: '/jp-all-weather-api/',
   ```

2. API のベースURLは [`src/config.ts`](src/config.ts)（環境変数 `PUBLIC_API_BASE`）で変更できます。
3. GitHub Pages を使う場合は、リポジトリの **Settings → Pages** で Source を「GitHub Actions」に設定してください。

## ライセンス

### ソースコード

本リポジトリのソースコードは [MIT License](LICENSE) に基づいて公開されています。

### 気象データ

本APIが配信する気象データは、気象庁の公開情報を加工・変換したものです。利用にあたっては「[政府標準利用規約（第2.0版）](https://www.kantei.go.jp/jp/headline/governmentservice/01.html)」に準拠し、出典および加工の事実を明記してください。

- データ出典: [気象庁ホームページ](https://www.jma.go.jp/)
- 本プロジェクトは気象庁公式のサービスではありません。
- 本APIの利用により生じた損害等について、開発者は一切の責任を負いません。
