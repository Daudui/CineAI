exports.handler = async (event) => {

  const API_KEY = process.env.TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  let path = event.queryStringParameters.path;

  if (!path) {
      return { 
          statusCode: 400, 
          body: JSON.stringify({ error: "Ugyldig API-rute" }) 
      };
  }

  // Pass på at vi har en skråstrek i starten
  if (!path.startsWith('/')) {
      path = '/' + path;
  }

  const { path: _, ...otherParams } = event.queryStringParameters;

  const urlParams = new URLSearchParams({
      api_key: API_KEY,
      ...otherParams
  });

  const fetchUrl = `${BASE_URL}${path}?${urlParams.toString()}`;

  try {
      const response = await fetch(fetchUrl);
      const data = await response.json();

      return {
          statusCode: response.status,
          headers: { 
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      };
  } catch (error) {
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Klarte ikke å koble til TMDB" })
      };
  }
};