const API_KEY = "4373bf50ac72cb90a213b26ad35db000";

export async function getWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=43.5081&lon=16.4402&units=metric&appid=${API_KEY}`
    );

    const data = await response.json();

    console.log("API RESPONSE:", data);

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.log("Weather fetch error:", error);
    return null;
  }
}