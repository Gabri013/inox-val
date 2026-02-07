/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_DEFAULT_EMPRESA_ID?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
