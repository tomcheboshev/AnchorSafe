import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';

type Ship = {
  mmsi: number;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
};

const shipsCol = collection(db, 'ships');

export async function loadCachedShips(): Promise<Ship[]> {
  const snap = await getDocs(shipsCol);
  return snap.docs.map(d => d.data() as Ship);
}

export function upsertShip(ship: Ship) {
  setDoc(doc(db, 'ships', String(ship.mmsi)), {
    ...ship,
    updatedAt: serverTimestamp(),
  });
}