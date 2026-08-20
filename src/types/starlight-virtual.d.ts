/**
 * エディタのLSP向けに、Starlight の仮想モジュールを型宣言する。
 * （ビルド時は Starlight が実モジュールを提供するため、この宣言は型解決専用）
 */
declare module "virtual:starlight/components/EditLink" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const EditLink: AstroComponentFactory;
  export default EditLink;
}
declare module "virtual:starlight/components/LastUpdated" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const LastUpdated: AstroComponentFactory;
  export default LastUpdated;
}
declare module "virtual:starlight/components/Pagination" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const Pagination: AstroComponentFactory;
  export default Pagination;
}
