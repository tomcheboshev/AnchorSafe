async function fetchWeatherForCoord(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m&wind_speed_unit=kn`
    );
    const data = await res.json();
    const c = data.current;

    return {
      temp: c?.temperature_2m != null ? `${Math.round(c.temperature_2m)}°` : '--',
      wind: c?.wind_speed_10m != null ? `${Math.round(c.wind_speed_10m)}kt` : '--',
    };
  } catch {
    return { temp: '--', wind: '--' };
  }
}

export async function fetchRestrictedZones() {
  const query = `
    [out:json][timeout:25];
    (
      relation["seamark:type"="restricted_area"](39.5,12.0,45.8,20.5);
      relation["seamark:type"="anchorage"](39.5,12.0,45.8,20.5);
      relation["seamark:type"="harbour"](39.5,12.0,45.8,20.5);
      node["seamark:type"="anchorage"](39.5,12.0,45.8,20.5);
      way["seamark:type"="anchorage"](39.5,12.0,45.8,20.5);
      way["seamark:type"="harbour"](39.5,12.0,45.8,20.5);
    );
    out geom;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const data = await res.json();

  const getType = (tags: any): 'safe' | 'danger' | 'caution' => {
    const t = tags?.['seamark:type'];
    if (t === 'anchorage' || t === 'harbour') return 'safe';
    if (t === 'restricted_area') return 'danger';
    return 'caution';
  };

  const getColor = (type: 'safe' | 'danger' | 'caution') => {
    if (type === 'safe') return '#34C759';
    if (type === 'danger') return '#FF3B30';
    return '#FFCC00';
  };

  const getCentroid = (coords: number[][]): [number, number] => {
    const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    return [lat, lng];
  };

  const rawZones = data.elements
    .map((el: any) => {
      let coords: number[][] = [];

      if (el.type === 'relation') {
        coords = el.members
          ?.filter((m: any) => m.type === 'way')
          ?.flatMap((m: any) => m.geometry?.map((g: any) => [g.lat, g.lon]) ?? []) ?? [];
      } else if (el.type === 'way') {
        coords = el.geometry?.map((g: any) => [g.lat, g.lon]) ?? [];
      }

      const type = getType(el.tags);

      return {
        id: String(el.id),
        name: el.tags?.name ?? el.tags?.['seamark:type'] ?? 'Unknown Zone',
        type,
        coords,
        subtitle: el.tags?.['seamark:type'] ?? '',
        temp: '--',
        wind: '--',
        color: getColor(type),
      };
    })
    .filter((z: any) => z.coords.length >= 3);

  // Земи weather за секоја зона паралелно
  const zonesWithWeather = await Promise.all(
    rawZones.map(async (zone: any) => {
      const [lat, lng] = getCentroid(zone.coords);
      const weather = await fetchWeatherForCoord(lat, lng);
      return { ...zone, ...weather };
    })
  );

  return zonesWithWeather;
}   