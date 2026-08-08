// netlify/functions/getmovies.js
exports.handler = async function (event, context) {
  try {
    let endpoint = event.queryStringParameters.endpoint || "movie/popular";

    // Vi bruker process.env som fungerer i alle Netlify-versjoner
    const apiKey = process.env.PRIVATE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "PRIVATE_API_KEY mangler i Netlify-dashboardet!",
        }),
      };
    }

    endpoint = endpoint.replace(/^\/+/, "");
    const url = `https://themoviedb.org{endpoint}?api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
