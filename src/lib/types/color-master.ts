export interface ToolDictionary {
  title: string;
  description: string;
  inspire: string;
  harmony: string;
  visionSimulator: string;
  normal: string;
  protanopia: string;
  deuteranopia: string;
  tritanopia: string;
  achromatopsia: string;
  shortcutsHelp: string;
  random: string;
  copyHex: string;
  save: string;
  reset: string;
  harmonies: {
    [key: string]: string;
  };
  guide: {
    title: string;
    intro: string;
    featuresTitle: string;
    f1: string;
    f2: string;
    f3: string;
    f4: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
    technicalTitle: string;
    tech1: string;
    tech2: string;
    tech3: string;
  };
  faqTitle: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  export: {
      title: string;
      copy: string;
      copied: string;
      download: string;
  };
  history: {
      title: string;
      empty: string;
      clear: string;
  };
  a11y: {
      title: string;
      ratio: string;
      level: string;
      pass: string;
      fail: string;
      largeText: string;
      normalText: string;
  };
}
