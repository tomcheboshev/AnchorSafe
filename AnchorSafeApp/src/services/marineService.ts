const API_KEY =
  "48df716e-51b8-11f1-81a8-0242ac120004-48df7358-51b8-11f1-81a8-0242ac120004";

export async function getMarineData() {
  try {
    const response = await fetch(
      "https://api.stormglass.io/v2/weather/point?lat=43.5081&lng=16.4402&params=waveHeight,swellHeight,windSpeed",
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}