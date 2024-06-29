import axios, {AxiosError, AxiosResponse} from "axios";

import {prismaClient} from "../database/prisma";
import {ErrorResponse, RecommendationResponse} from "../interfaces";
import {getPreferencesOfUser} from "./handleUserPreferences";

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

export async function fetchRecommendationsBasedOnSinglePreference(
  preference: string,
): Promise<RecommendationResponse | ErrorResponse> {
  try {
    const response: AxiosResponse<RecommendationResponse> = await axios.post(
      "http://127.0.0.1:5000/recommend/llm",
      {
        media_name: preference,
      },
    );

    // Check if the request was successful
    if (response.status === 200) {
      return response.data;
    } else {
      const errorMessage = `Failed to fetch recommendations based on preference. Status code: ${response.status} (${response.statusText})`;
      console.error(errorMessage);
      console.error("Response data:", response.data);
      return {error: errorMessage};
    }
  } catch (error) {
    // Log detailed error message
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      const errorMessage = `Error while fetching recommendations based on preference. Status code: ${axiosError.response?.status} (${axiosError.response?.statusText})`;
      console.error(errorMessage);
      console.error("Response data:", axiosError.response?.data);
      return {error: errorMessage};
    } else {
      const errorMessage = `Unexpected error while fetching recommendations based on preference:`;
      console.error(errorMessage);
      return {error: errorMessage};
    }
  }
}

export async function fetchRecommendationsBasedOnUserPreferences(
  userId: number,
  startUp: boolean,
): Promise<RecommendationResponse> {
  try {
    // Get the preferences of the user
    const preferences = await getPreferencesOfUser(userId);

    // Randomly choose 3 preferences, or fewer if there are fewer preferences
    const numberOfPreferencesToChoose = Math.min(preferences.length, 3);

    // Shuffle the preferences array to randomly choose preferences
    const shuffledPreferences = shuffleArray(preferences);

    // Select the first `numberOfPreferencesToChoose` preferences from the shuffled array
    const selectedPreferences = shuffledPreferences.slice(
      0,
      numberOfPreferencesToChoose,
    );

    // Fetch recommendations for each selected preference
    const recommendationsPromises = selectedPreferences.map((name) =>
      fetchRecommendationsBasedOnSinglePreference(name),
    );

    const recommendations = await Promise.all(recommendationsPromises);

    // Initialize temporary sets to keep track of added items
    const addedBooks = new Set<string>();
    const addedMovies = new Set<string>();
    const addedSongs = new Set<string>();

    // Initialize counters to track the number of recommendations added
    let limit = startUp ? 10 : 2;

    // Merge recommendations for preferences
    const mergedRecommendations: RecommendationResponse = {
      books: [],
      movies: [],
      songs: [],
    };

    for (const recommendation of recommendations) {
      let bookCount = 0;
      let movieCount = 0;
      let songCount = 0;
      if (
        "books" in recommendation &&
        "movies" in recommendation &&
        "songs" in recommendation
      ) {
        // Add unique books and limit to 2 books
        for (const book of recommendation.books) {
          if (!addedBooks.has(book) && bookCount < limit) {
            mergedRecommendations.books.push(book);
            addedBooks.add(book);
            bookCount++;
          }
        }

        // Add unique movies and limit to 2 movies
        for (const movie of recommendation.movies) {
          if (!addedMovies.has(movie) && movieCount < limit) {
            mergedRecommendations.movies.push(movie);
            addedMovies.add(movie);
            movieCount++;
          }
        }

        // Add unique songs and limit to 2 songs
        for (const song of recommendation.songs) {
          if (!addedSongs.has(song) && songCount < limit) {
            mergedRecommendations.songs.push(song);
            addedSongs.add(song);
            songCount++;
          }
        }
      } else {
        console.error("Error fetching recommendations:", recommendation.error);
        // Handle error case
      }
    }

    return mergedRecommendations;
  } catch (error) {
    console.error("Error:", error);
    // If an error occurs, return an empty object
    return {
      books: [],
      movies: [],
      songs: [],
    };
  }
}
