const API_KEY =
  "80658092e5f54f40b2c92e3126ee198d";

export async function getMarineNews() {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=marine OR ship OR storm OR coastguard&language=en&apiKey=${API_KEY}`
    );

    return await response.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}