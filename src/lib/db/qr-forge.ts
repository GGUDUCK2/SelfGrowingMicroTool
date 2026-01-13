import Dexie, { type Table } from 'dexie';
import type { QRState } from '../utils/qr-forge/types';

export class QRForgeDB extends Dexie {
    history!: Table<QRState, number>;

    constructor() {
        super('QRForgeDB');
        this.version(1).stores({
            history: '++id, type, createdAt, starred'
        });
    }
}

export const db = new QRForgeDB();
