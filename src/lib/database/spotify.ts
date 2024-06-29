import {SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET} from "../constants";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let lastTokenFetchTime: number | null = null; // Variable to store the time of
// the last token fetchh
let spotifyToken: string | null = null; // Variable to store the current
// Spotify tokenn

const fetchSpotifyToken = async () => {
  try {
    const credentials: string = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
    const base64Credentials: string =
      Buffer.from(credentials).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${base64Credentials}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      console.error("Failed to fetch Spotify token");
    }

    const data = (await response.json()) as SpotifyTokenResponse; // Type
    // assertionn
    spotifyToken = data.access_token;
    lastTokenFetchTime = Date.now(); // Record the time of token fetch
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
  }
};

export async function getSpotifyTokens(): Promise<null | string> {
  // Check if the token is null or if it has expired
  if (
    !spotifyToken ||
    !lastTokenFetchTime ||
    Date.now() - lastTokenFetchTime > 3000000
  ) {
    await fetchSpotifyToken(); // Fetch new token if null or expired
  }
  return spotifyToken;
}
