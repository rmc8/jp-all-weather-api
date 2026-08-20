// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	// デプロイ先の URL に合わせて site / base を変更してください。
	site: 'https://weather.rmc-8.com',
	base: process.env.ASTRO_BASE ?? '/',
	integrations: [
		starlight({
			title: 'All Weather',
			description: '気象庁(JMA)の天気データを WeatherAPI.com / OpenWeatherMap / Open-Meteo / Livedoor の各形式へ変換して配信する天気APIのドキュメント。',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/rmc8/jp-all-weather-api' },
			],
			components: {
				SiteTitle: './src/components/Overrides/SiteTitle.astro',
				PageTitle: './src/components/Overrides/PageTitle.astro',
				ThemeSelect: './src/components/Overrides/ThemeSelect.astro',
				Hero: './src/components/Overrides/Hero.astro',
				Footer: './src/components/Overrides/Footer.astro',
			},
			editLink: {
				baseUrl: 'https://github.com/rmc8/jp-all-weather-api/edit/main/',
			},
			customCss: [
				'./src/styles/fonts.css',
				'./src/styles/starwind.css',
				'./src/styles/global.css',
			],
			sidebar: [
				{
					label: 'はじめに',
					items: [
						{ label: 'ホーム', slug: 'index' },
						{ label: 'クイックスタート', slug: 'guides/quickstart' },
						{ label: '気象庁仕様と注意事項', slug: 'guides/jma-spec' },
						{ label: 'フォーマット一覧', slug: 'guides/formats' },
					],
				},
				{
					label: 'リファレンス',
					items: [
						{ label: '天気API', slug: 'reference/weather-api' },
						{ label: 'エリア一覧', slug: 'reference/areas' },
						{ label: 'レスポンス形式', slug: 'reference/response-format' },
					],
				},
			],
		}),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
