export function geoJsonToZones(geojson: any) {

  const DANGER_TYPES = [
    'rock',
    'wreck',
    'obstruction',
    'shoal',
    'reef',
    'restricted_area',
    'military_area',
  ];

  const SAFE_TYPES = [
    'harbour',
    'anchorage',
    'marina',
  ];

  return geojson.features
    .map((feature: any, index: number) => {

      const props = feature.properties || {};
      const geometry = feature.geometry || {};

      const seamarkType =
        props['seamark:type'] ||
        props.type ||
        'unknown';

      // -------------------------
      // Determine danger/safe
      // -------------------------
      const isDanger =
        DANGER_TYPES.includes(seamarkType);

      const isSafe =
        SAFE_TYPES.includes(seamarkType);

      // Ignore unrelated objects
      if (!isSafe && !isDanger) {
        return null;
      }

      // -------------------------
      // Colors
      // -------------------------
      const color = isDanger
        ? '#FF3B30'
        : '#34C759';

      const fillColor = isDanger
        ? 'rgba(255,59,48,0.25)'
        : 'rgba(52,199,89,0.25)';

      // -------------------------
      // Geometry conversion
      // -------------------------
      let coords: number[][] = [];

      // POINT → fake circular polygon
      if (geometry.type === 'Point') {

        const [lng, lat] =
          geometry.coordinates;

        coords = createCirclePolygon(
          lat,
          lng,
          0.002
        );
      }

      // POLYGON
      else if (
        geometry.type === 'Polygon'
      ) {

        coords =
          geometry.coordinates[0].map(
            ([lng, lat]: number[]) => [
              lat,
              lng,
            ]
          );
      }

      // MULTIPOLYGON
      else if (
        geometry.type === 'MultiPolygon'
      ) {

        coords =
          geometry.coordinates[0][0].map(
            ([lng, lat]: number[]) => [
              lat,
              lng,
            ]
          );
      }

      // LINESTRING
      else if (
        geometry.type === 'LineString'
      ) {

        coords =
          geometry.coordinates.map(
            ([lng, lat]: number[]) => [
              lat,
              lng,
            ]
          );
      }

      return {
        id:
          props.id ||
          `zone_${index}`,

        name:
          props.name ||
          props['seamark:name'] ||
          'Unnamed Zone',

        type:
          isDanger
            ? 'danger'
            : 'safe',

        subtitle: seamarkType,

        temp: '--',

        wind: '--',

        color,

        fillColor,

        coords,
      };
    })
    .filter(Boolean);
}

function createCirclePolygon(
  lat: number,
  lng: number,
  radius = 0.002,
  points = 24
) {

  const coords: number[][] = [];

  for (let i = 0; i < points; i++) {

    const angle =
      (i / points) *
      Math.PI *
      2;

    const dx =
      Math.cos(angle) *
      radius;

    const dy =
      Math.sin(angle) *
      radius;

    coords.push([
      lat + dy,
      lng + dx,
    ]);
  }

  return coords;
}