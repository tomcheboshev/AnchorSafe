// services/zoneService.ts
import { db } from '../firebase';
import {
  collection, doc, setDoc, getDocs,
  writeBatch, query, limit,
} from 'firebase/firestore';

export type Zone = {
  id: string;
  name: string;
  type: 'safe' | 'danger' | 'caution';
  subtitle: string;
  temp: string;
  wind: string;
  color: string;
  coords: number[][];
};

const zonesCol = collection(db, 'zones');

// Firestore batch limit = 500 операции
const BATCH_SIZE = 400;

export async function uploadZonesToFirestore(zones: Zone[]) {
  // Подели во групи од 400 (Firestore лимит е 500)
  for (let i = 0; i < zones.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = zones.slice(i, i + BATCH_SIZE);

    chunk.forEach((zone) => {
      const ref = doc(db, 'zones', zone.id);
      batch.set(ref, {
        ...zone,
        coords: zone.coords.map(([lat, lng]) => ({ lat, lng })),
      });
    });

    await batch.commit(); // 1 мрежен повик наместо 400
  }
}

export async function loadZonesFromFirestore(): Promise<Zone[]> {
  const snap = await getDocs(zonesCol);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      coords: data.coords.map((c: { lat: number; lng: number }) => [c.lat, c.lng]),
    } as Zone;
  });
}