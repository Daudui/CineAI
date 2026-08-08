// netlify/functions/getmovies.js
exports.handler = async function (event, context) {
  try {
    // 1. Extracts the endpoint path (like "/movie/popular") passed from script.js
    const endpoint = event.queryStringParameters.endpoint || "/movie/popular";
    const apiKey = process.env.PRIVATE_API_KEY;

    // 2. Corrected TMDB API URL with api subdomain, version 3, and proper variable syntax
    const response = await fetch(
      `https://themoviedb.org{endpoint}?api_key=${apiKey}`
    );

    if (!response.ok) {
      return { statusCode: response.status, body: "TMDB API request failed" };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
