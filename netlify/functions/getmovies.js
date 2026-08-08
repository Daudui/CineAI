// netlify/functions/getmovies.js
const https = require("https");

exports.handler = async function (event, context) {
  try {
    let endpoint = event.queryStringParameters.endpoint || "movie/popular";
    const apiKey = process.env.PRIVATE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "PRIVATE_API_KEY mangler i Netlify-dashboardet!",
        }),
      };
    }

    // Rens unna eventuelle skråstreker foran
    endpoint = endpoint.replace(/^\/+/, "");

    const url = `https://themoviedb.org{endpoint}?api_key=${apiKey}`;

    // Vi tvinger forespørselen gjennom med Node sin egen HTTPS-klient
    const getTMDBData = () => {
      return new Promise((resolve, reject) => {
        https
          .get(url, (res) => {
            let rawData = "";
            res.on("data", (chunk) => {
              rawData += chunk;
            });
            res.on("end", () => {
              resolve({
                statusCode: res.statusCode,
                body: rawData,
              });
            });
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    };

    const result = await getTMDBData();

    return {
      statusCode: result.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Hindrer CORS-feil i nettleseren
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: result.body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server krasjet: " + error.message }),
    };
  }
};
