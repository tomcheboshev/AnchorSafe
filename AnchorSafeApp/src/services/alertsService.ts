import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

export async function generateWeatherAlerts(
  weather: any
) {
  if (!weather) return;

  const windSpeed = weather.wind.speed;

if (windSpeed > 10) {
  const q = query(
    collection(db, "marine_alerts"),
    where("title", "==", "Storm Warning")
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    console.log("Storm alert already exists");

    return;
  }

  await addDoc(collection(db, "marine_alerts"), {
    title: "Storm Warning",
    description: `Strong winds (${windSpeed} m/s)`,
    severity: "HIGH",
    type: "WEATHER",
    source: "AUTO_SYSTEM",
    isActive: true,
    createdAt: new Date(),
  });

  console.log("Storm alert created!");
}
}

export async function generateMarineAlerts(
  marine: any
) {
  if (!marine?.hours?.length) return;

  const waveHeight =
    marine.hours[0].waveHeight?.noaa || 0;

  if (waveHeight > 3) {
  const q = query(
    collection(db, "marine_alerts"),
    where("title", "==", "Dangerous Waves")
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    console.log("Marine alert already exists");

    return;
  }

  await addDoc(collection(db, "marine_alerts"), {
    title: "Dangerous Waves",
    description: `Wave height: ${waveHeight}m`,
    severity: "HIGH",
    type: "MARINE",
    source: "STORMGLASS",
    isActive: true,
    createdAt: new Date(),
  });

  console.log("Marine alert created!");
}
}

export async function generateNewsAlerts(
  news: any
) {
  if (!news?.articles?.length) return;

 const shuffled = news.articles.sort(
  () => 0.5 - Math.random()
);

for (const article of shuffled.slice(0, 4)) {
    // skip invalid articles
    if (!article.title || !article.description)
      continue;

    // CHECK IF ALERT EXISTS
    const q = query(
    collection(db, "marine_alerts"),
    where("title", "==", article.title),
    where("type", "==", "NEWS")
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log("News alert already exists");
      continue;
    }

    // CREATE ALERT
    await addDoc(collection(db, "marine_alerts"), {
      title: article.title,
      description: article.description,
      severity: "MEDIUM",
      type: "NEWS",
      source: "NEWS_API",
      isActive: true,
      createdAt: new Date(),
      url: article.url,
    });

    console.log("News alert created!");
  }
}

export async function getMarineAlerts() {
  try {
    const snapshot = await getDocs(
      collection(db, "marine_alerts")
    );

    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return alerts
  .sort(
    (a: any, b: any) =>
      b.createdAt?.seconds -
      a.createdAt?.seconds
  )
  .slice(0, 4);
  } catch (error) {
    console.log(error);
    return [];
  }
}