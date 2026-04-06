import { writable } from 'svelte/store';

export interface ShadowLayer {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string; // rgba
    inset: boolean;
    enabled: boolean;
    id: string;
}

export type ShadowMode = 'custom' | 'smooth' | 'neumorphism';

export interface ShadowConfig {
    mode: ShadowMode;
    layers: ShadowLayer[];

    // Smooth shadows parameters
    smoothConfig: {
        layersCount: number;
        distance: number; // Max y
        alpha: number; // Base alpha for first layer
        blurMultiplier: number;
        easing: 'linear' | 'easeOut' | 'easeIn' | 'easeInOut';
    };

    // Neumorphism parameters
    neumorphismConfig: {
        distance: number;
        intensity: number;
        blur: number;
        shape: 'flat' | 'concave' | 'convex' | 'pressed';
        lightPosition: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    };

    // Canvas & Target Element config
    canvas: {
        bgColor: string;
        boxColor: string;
        width: number;
        height: number;
        borderRadius: number;
    };
}

export const createDefaultConfig = (): ShadowConfig => ({
    mode: 'custom',
    layers: [
        { id: Math.random().toString(36).substr(2, 9), x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0, 0, 0, 0.1)', inset: false, enabled: true },
        { id: Math.random().toString(36).substr(2, 9), x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0, 0, 0, 0.05)', inset: false, enabled: true }
    ],
    smoothConfig: {
        layersCount: 6,
        distance: 50,
        alpha: 0.07,
        blurMultiplier: 1.5,
        easing: 'easeOut'
    },
    neumorphismConfig: {
        distance: 20,
        intensity: 0.15,
        blur: 40,
        shape: 'flat',
        lightPosition: 'topLeft'
    },
    canvas: {
        bgColor: '#e0e5ec',
        boxColor: '#e0e5ec',
        width: 250,
        height: 250,
        borderRadius: 24
    }
});

export const shadowStore = writable<ShadowConfig>(createDefaultConfig());

// Helper functions to generate CSS
export const generateShadowCSS = (config: ShadowConfig): string => {
    let layersToRender: ShadowLayer[] = [];

    if (config.mode === 'custom') {
        layersToRender = config.layers.filter(l => l.enabled);
    } else if (config.mode === 'smooth') {
        layersToRender = generateSmoothLayers(config.smoothConfig);
    } else if (config.mode === 'neumorphism') {
        layersToRender = generateNeumorphismLayers(config.neumorphismConfig, config.canvas.bgColor);
    }

    if (layersToRender.length === 0) return 'none';

    return layersToRender.map(l => {
        const prefix = l.inset ? 'inset ' : '';
        return `${prefix}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`;
    }).join(',\n  ');
};

const easingFunctions = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};

function generateSmoothLayers(config: ShadowConfig['smoothConfig']): ShadowLayer[] {
    const layers: ShadowLayer[] = [];
    const { layersCount, distance, alpha, blurMultiplier, easing } = config;
    const ease = easingFunctions[easing];

    for (let i = 1; i <= layersCount; i++) {
        // t goes from (1/layersCount) to 1
        const t = i / layersCount;
        const easedT = ease(t);

        const y = Math.round(distance * easedT * 10) / 10;
        const blur = Math.round(y * blurMultiplier * 10) / 10;
        const spread = 0; // Keeping spread 0 for smooth shadows is usually best

        // Alpha usually decreases or increases based on preference.
        // For classic smooth shadows, the alpha might be constant or slightly increase
        const currentAlpha = Math.round((alpha * 100)) / 100;

        layers.push({
            id: `smooth-${i}`,
            x: 0,
            y,
            blur,
            spread,
            color: `rgba(0, 0, 0, ${currentAlpha})`,
            inset: false,
            enabled: true
        });
    }
    return layers;
}

// Convert hex to HSL/RGB for Neumorphism
function hexToRgb(hex: string) {
    let c: any;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length === 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return {
            r: (c >> 16) & 255,
            g: (c >> 8) & 255,
            b: c & 255
        };
    }
    return { r: 224, g: 229, b: 236 }; // Default #e0e5ec
}

function adjustColor(color: {r: number, g: number, b: number}, amount: number) {
    return {
        r: Math.max(0, Math.min(255, color.r + amount)),
        g: Math.max(0, Math.min(255, color.g + amount)),
        b: Math.max(0, Math.min(255, color.b + amount))
    };
}

function rgbaString(color: {r: number, g: number, b: number}, alpha: number) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function generateNeumorphismLayers(config: ShadowConfig['neumorphismConfig'], bgColorHex: string): ShadowLayer[] {
    const { distance, intensity, blur, shape, lightPosition } = config;
    const baseRgb = hexToRgb(bgColorHex);

    // Light color is always white-ish with intensity
    const lightColor = rgbaString({r: 255, g: 255, b: 255}, intensity * 5 > 1 ? 1 : intensity * 5); // Brighter
    // Dark color is darker version of bg
    const darkColorObj = adjustColor(baseRgb, -Math.round(intensity * 100));
    const darkColor = rgbaString(darkColorObj, intensity * 2 > 1 ? 1 : intensity * 2);

    let x = distance;
    let y = distance;

    if (lightPosition === 'topRight') { x = -distance; y = distance; }
    else if (lightPosition === 'bottomLeft') { x = distance; y = -distance; }
    else if (lightPosition === 'bottomRight') { x = -distance; y = -distance; }

    const isInset = shape === 'pressed' || shape === 'concave';

    // For concave/convex we use background gradients, but for shadow we still need layers.
    // Simplifying standard Neumorphism shadows:
    let layers: ShadowLayer[] = [];

    if (shape === 'pressed') {
        layers = [
            { id: 'n1', x, y, blur, spread: 0, color: darkColor, inset: true, enabled: true },
            { id: 'n2', x: -x, y: -y, blur, spread: 0, color: lightColor, inset: true, enabled: true }
        ];
    } else {
        layers = [
            { id: 'n1', x, y, blur, spread: 0, color: darkColor, inset: false, enabled: true },
            { id: 'n2', x: -x, y: -y, blur, spread: 0, color: lightColor, inset: false, enabled: true }
        ];
    }

    return layers;
}

export const getNeumorphismBackground = (config: ShadowConfig['neumorphismConfig'], bgColorHex: string) => {
    if (config.shape === 'flat' || config.shape === 'pressed') return bgColorHex;

    const baseRgb = hexToRgb(bgColorHex);
    const light = rgbaString(adjustColor(baseRgb, 15), 1);
    const dark = rgbaString(adjustColor(baseRgb, -15), 1);

    let deg = 145;
    if (config.lightPosition === 'topRight') deg = 225;
    else if (config.lightPosition === 'bottomRight') deg = 315;
    else if (config.lightPosition === 'bottomLeft') deg = 45;

    if (config.shape === 'convex') {
        return `linear-gradient(${deg}deg, ${light}, ${dark})`;
    } else if (config.shape === 'concave') {
        return `linear-gradient(${deg}deg, ${dark}, ${light})`;
    }
    return bgColorHex;
};
