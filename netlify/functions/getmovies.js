// netlify/functions/getmovies.js
exports.handler = async function (event, context) {
  try {
    let endpoint = event.queryStringParameters.endpoint || "movie/popular";
    const apiKey = process.env.PRIVATE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API-nøkkel mangler på serveren" }),
      };
    }

    // Tvinger fjerning av skråstrek på starten slik at vi ikke får "3//movie/popular"
    if (endpoint.startsWith("/")) {
      endpoint = endpoint.substring(1);
    }

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
