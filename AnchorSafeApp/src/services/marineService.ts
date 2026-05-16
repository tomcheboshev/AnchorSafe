const API_KEY =
  "f80a4c6c-5173-11f1-bdb4-0242ac120004-f80a4d2a-5173-11f1-bdb4-0242ac120004";

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