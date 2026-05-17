// services/zoneService.ts
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

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

export async function uploadZonesToFirestore(zones: Zone[]) {
  for (const zone of zones) {
    await setDoc(doc(db, 'zones', zone.id), {
      ...zone,
      // Flatten coords: [[lat,lng],[lat,lng]] → [{lat,lng},{lat,lng}]
      coords: zone.coords.map(([lat, lng]) => ({ lat, lng })),
    });
  }
}

export async function loadZonesFromFirestore(): Promise<Zone[]> {
  const snap = await getDocs(zonesCol);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      // Конвертирај назад во array format
      coords: data.coords.map((c: { lat: number; lng: number }) => [c.lat, c.lng]),
    } as Zone;
  });
}