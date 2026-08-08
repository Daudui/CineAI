// netlify/functions/getmovies.js
const https = require("https");

exports.handler = async function (event, context) {
  try {
    let endpoint = event.queryStringParameters.endpoint || "movie/popular";
    const apiKey = process.env.PRIVATE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API-nøkkel mangler!" }),
      };
    }

    // Vask bort eventuelle skråstreker foran
    endpoint = endpoint.replace(/^\/+/, "");

    const url = `https://themoviedb.org{endpoint}?api_key=${apiKey}`;

    // Vi bruker en stabil, rå HTTPS-forespørsel for å omgå Node sin ustabile fetch
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
        "Access-Control-Allow-Origin": "*", // Forhindrer CORS-blokkering på frontend
      },
      body: result.body,
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
