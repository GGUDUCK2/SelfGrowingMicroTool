export interface IconForgeDictionary {
  title: string;
  description: string;
  upload: {
    title: string;
    dragDrop: string;
    formats: string;
    reupload: string;
    example: string;
  };
  config: {
    title: string;
    background: string;
    padding: string;
    radius: string;
    transparent: string;
    preview: string;
    name: string;
    shortName: string;
  };
  platforms: {
    browser: string;
    iphone: string;
    android: string;
    windows: string;
    macos: string;
    search: string;
  };
  export: {
    title: string;
    download: string;
    formats: string;
    favicon: string;
    pwa: string;
    svg: string;
    manifest: string;
    generating: string;
    downloaded: string;
  };
  snippets: {
    title: string;
    html: string;
    base64: string;
    manifest: string;
    copy: string;
  };
  history: {
    title: string;
    save: string;
    restore: string;
    delete: string;
    empty: string;
    saveSuccess?: string; // Adding optional as it might be used
    restoreSuccess?: string;
  };
  guide: {
    title: string;
    intro: string;
    featuresTitle: string;
    f1: string;
    f2: string;
    f3: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
  };
  faqTitle: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  q3: string;
  a3: string;
  // New features
  magicPalette?: string;
  safeZone?: string;
  manifestSettings?: {
    title: string;
    startUrl: string;
    display: string;
  };
}
