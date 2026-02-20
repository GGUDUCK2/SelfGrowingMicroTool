import { db, type ZenForgeMix } from '$lib/db';
import { liveQuery } from 'dexie';

export { type ZenForgeMix };

export function getMixes() {
    return liveQuery(() => db.zenForgeMixes.orderBy('createdAt').reverse().toArray());
}

export async function saveMix(name: string, tracks: { id: string; volume: number; muted: boolean }[]) {
    return await db.zenForgeMixes.add({
        name,
        tracks,
        createdAt: new Date(),
        starred: 0
    });
}

export async function deleteMix(id: number) {
    return await db.zenForgeMixes.delete(id);
}

export async function toggleStar(id: number, currentStarred: number = 0) {
    return await db.zenForgeMixes.update(id, { starred: currentStarred ? 0 : 1 });
}
