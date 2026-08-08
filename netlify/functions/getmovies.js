// netlify/functions/getmovies.js
const http = require("https");

exports.handler = async function (event, context) {
  try {
    const endpoint = event.queryStringParameters.endpoint || "/movie/popular";
    const apiKey = process.env.PRIVATE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "PRIVATE_API_KEY mangler på Netlify!" }),
      };
    }

    // Vi bruker en stabil innebygd HTTPS-forespørsel for å være 100% sikre på Node-kompatibilitet
    const url = `https://themoviedb.org{endpoint}?api_key=${apiKey}`;

    const fetchData = () => {
      return new Promise((resolve, reject) => {
        http
          .get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () =>
              resolve({ statusCode: res.statusCode, body: data })
            );
          })
          .on("error", (err) => reject(err));
      });
    };

    const tmdbResponse = await fetchData();

    return {
      statusCode: tmdbResponse.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Sikrer mot CORS-blokkering
      },
      body: tmdbResponse.body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
