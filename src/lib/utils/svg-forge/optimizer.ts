import { optimize, type Config, type OptimizeOptions } from 'svgo/browser';

export interface SvgoConfig {
  multipass: boolean;
  plugins: {
    removeDoctype: boolean;
    removeXMLProcInst: boolean;
    removeComments: boolean;
    removeMetadata: boolean;
    removeEditorsNSData: boolean;
    cleanupAttrs: boolean;
    mergeStyles: boolean;
    inlineStyles: boolean;
    minifyStyles: boolean;
    cleanupIds: boolean;
    removeUselessDefs: boolean;
    cleanupNumericValues: boolean;
    convertColors: boolean;
    removeUnknownsAndDefaults: boolean;
    removeNonInheritableGroupAttrs: boolean;
    removeUselessStrokeAndFill: boolean;
    removeViewBox: boolean;
    cleanupEnableBackground: boolean;
    removeHiddenElems: boolean;
    removeEmptyText: boolean;
    convertShapeToPath: boolean;
    convertEllipseToCircle: boolean;
    moveElemsAttrsToGroup: boolean;
    moveGroupAttrsToElems: boolean;
    collapseGroups: boolean;
    convertPathData: boolean;
    convertTransform: boolean;
    removeEmptyAttrs: boolean;
    removeEmptyContainers: boolean;
    mergePaths: boolean;
    removeUnusedNS: boolean;
    sortAttrs: boolean;
    sortDefsChildren: boolean;
    removeTitle: boolean;
    removeDesc: boolean;
    removeDimensions: boolean;
    removeStyleElement: boolean;
    removeScriptElement: boolean;
  };
}

export const defaultSvgoConfig: SvgoConfig = {
  multipass: true,
  plugins: {
    removeDoctype: true,
    removeXMLProcInst: true,
    removeComments: true,
    removeMetadata: true,
    removeEditorsNSData: true,
    cleanupAttrs: true,
    mergeStyles: true,
    inlineStyles: true,
    minifyStyles: true,
    cleanupIds: true,
    removeUselessDefs: true,
    cleanupNumericValues: true,
    convertColors: true,
    removeUnknownsAndDefaults: true,
    removeNonInheritableGroupAttrs: true,
    removeUselessStrokeAndFill: true,
    removeViewBox: false, // Often bad to remove
    cleanupEnableBackground: true,
    removeHiddenElems: true,
    removeEmptyText: true,
    convertShapeToPath: true,
    convertEllipseToCircle: true,
    moveElemsAttrsToGroup: true,
    moveGroupAttrsToElems: true,
    collapseGroups: true,
    convertPathData: true,
    convertTransform: true,
    removeEmptyAttrs: true,
    removeEmptyContainers: true,
    mergePaths: true,
    removeUnusedNS: true,
    sortAttrs: true,
    sortDefsChildren: true,
    removeTitle: true,
    removeDesc: true,
    removeDimensions: false, // Typically keep dimensions
    removeStyleElement: false,
    removeScriptElement: false,
  }
};

export function optimizeSvg(svgString: string, config: SvgoConfig): { data: string; info: any; error?: string } {
  try {
    const pluginsArray = Object.entries(config.plugins)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => name);

    const optimizeOptions: Config = {
      multipass: config.multipass,
      plugins: pluginsArray as any,
    };

    const result = optimize(svgString, optimizeOptions);
    return { data: result.data, info: result };
  } catch (err: any) {
    return { data: svgString, info: null, error: err.message || 'Optimization failed' };
  }
}
