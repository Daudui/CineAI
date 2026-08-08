// netlify/functions/getmovies.js
const https = require("https");

exports.handler = async function (event, context) {
  try {
    // Henter endepunktet fra frontend, f.eks. "movie/popular"
    let endpoint = event.queryStringParameters.endpoint || "movie/popular";
    const apiKey = process.env.PRIVATE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "PRIVATE_API_KEY mangler i Netlify dashboard!",
        }),
      };
    }

    // Vasker bort eventuelle skråstreker på starten av endepunktet
    endpoint = endpoint.replace(/^\/+/, "");

    // Bygger den korrekte URL-en til TMDB
    const url = `https://themoviedb.org{endpoint}?api_key=${apiKey}`;

    // Vi bruker en Promise for å hente dataen stabilt via https-modulen
    const movieData = await new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let rawData = "";
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            resolve({ statusCode: res.statusCode, body: rawData });
          });
        })
        .on("error", (e) => {
          reject(e);
        });
    });

    // Returnerer dataen tilbake til din script.js frontend
    return {
      statusCode: movieData.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Forhindrer CORS-feil i nettleseren
      },
      body: movieData.body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
