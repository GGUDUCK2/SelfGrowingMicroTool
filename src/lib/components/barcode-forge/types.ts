export interface BarcodeState {
    format: 'CODE128' | 'CODE128A' | 'CODE128B' | 'CODE128C' | 'EAN13' | 'EAN8' | 'UPC' | 'UPCE' | 'ITF14' | 'ITF' | 'MSI' | 'MSI10' | 'MSI11' | 'MSI1010' | 'MSI1110' | 'pharmacode' | 'codabar';
    value: string;
    design: {
        width: number;
        height: number;
        margin: number;
        displayValue: boolean;
        fontOptions: string;
        font: string;
        textAlign: 'left' | 'center' | 'right';
        textPosition: 'bottom' | 'top';
        textMargin: number;
        fontSize: number;
        background: string;
        lineColor: string;
    };
    bulk: {
        values: string;
    };
    type: 'single' | 'bulk';
}

export const defaultState: BarcodeState = {
    format: 'CODE128',
    value: '1234567890',
    design: {
        width: 2,
        height: 100,
        margin: 10,
        displayValue: true,
        fontOptions: '',
        font: 'monospace',
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2,
        fontSize: 20,
        background: '#ffffff',
        lineColor: '#000000'
    },
    bulk: {
        values: ''
    },
    type: 'single'
};
