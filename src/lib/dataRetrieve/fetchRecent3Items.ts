import axios, {AxiosError, AxiosResponse} from "axios";

import {prismaClient} from "../database/prisma";
import {ErrorResponse, RecommendationResponse} from "../interfaces";

const prisma = prismaClient;

export async function getRecentItemNames(userId: number): Promise<string[]> {
  const recentItems = await prisma.recentItems.findMany({
    where: {userId},
    orderBy: {addedAt: "desc"},
    take: 3,
    include: {item: {select: {title: true}}},
  });

  return recentItems.map((item) => item.item.title);
}

export async function fetchRecommendations(
  itemTitle: string,
): Promise<RecommendationResponse | ErrorResponse> {
  try {
    const response: AxiosResponse<RecommendationResponse> = await axios.post(
      "http://127.0.0.1:5000/recommend/combined",
      {
        media_name: itemTitle,
      },
    );

    // Check if the request was successful
    if (response.status === 200) {
      return response.data;
    } else {
      const errorMessage = `Failed to fetch recommendations. Status code: ${response.status} (${response.statusText})`;
      console.error(errorMessage);
      console.error("Response data:", response.data);
      return {error: errorMessage};
    }
  } catch (error) {
    // Log detailed error message
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      const errorMessage = `Error while fetching recommendations. Status code: ${axiosError.response?.status} (${axiosError.response?.statusText})`;
      console.error(errorMessage);
      console.error("Response data:", axiosError.response?.data);
      return {error: errorMessage};
    } else {
      const errorMessage = `Unexpected error while fetching recommendations:`;
      console.error(errorMessage);
      return {error: errorMessage};
    }
  }
}

export async function fetchRecommendationsLLM(
  itemTitle: string,
): Promise<RecommendationResponse | ErrorResponse> {
  try {
    const response: AxiosResponse<RecommendationResponse> = await axios.post(
      "http://127.0.0.1:5000/recommend/llm",
      {
        media_name: itemTitle,
      },
    );

    // Check if the request was successful
    if (response.status === 200) {
      return response.data;
    } else {
      const errorMessage = `Failed to fetch recommendations. Status code: ${response.status} (${response.statusText})`;
      console.error(errorMessage);
      console.error("Response data:", response.data);
      return {error: errorMessage};
    }
  } catch (error) {
    // Log detailed error message
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      const errorMessage = `Error while fetching recommendations. Status code: ${axiosError.response?.status} (${axiosError.response?.statusText})`;
      console.error(errorMessage);
      console.error("Response data:", axiosError.response?.data);
      return {error: errorMessage};
    } else {
      const errorMessage = `Unexpected error while fetching recommendations:`;
      console.error(errorMessage);
      return {error: errorMessage};
    }
  }
}

export async function fetchRecommendationsForRecentItems(
  userId: number,
): Promise<RecommendationResponse> {
  try {
    // Get the titles of the 3 most recent items for the user
    const recentItemNames = await getRecentItemNames(userId);

    // Fetch recommendations for each recent item
    const recommendationsPromises = recentItemNames.map((itemTitle) =>
      fetchRecommendations(itemTitle),
    );
    const recommendations = await Promise.all(recommendationsPromises);

    // Initialize temporary sets to keep track of added items
    const addedBooks = new Set<string>();
    const addedMovies = new Set<string>();
    const addedSongs = new Set<string>();

    // Merge recommendations for all recent items
    const mergedRecommendations: RecommendationResponse = {
      books: [],
      movies: [],
      songs: [],
    };

    for (const recommendation of recommendations) {
      if (
        "books" in recommendation &&
        "movies" in recommendation &&
        "songs" in recommendation
      ) {
        // Add unique books
        for (const book of recommendation.books) {
          if (!addedBooks.has(book)) {
            mergedRecommendations.books.push(book);
            addedBooks.add(book);
          }
        }

        // Add unique movies
        for (const movie of recommendation.movies) {
          if (!addedMovies.has(movie)) {
            mergedRecommendations.movies.push(movie);
            addedMovies.add(movie);
          }
        }

        // Add unique songs
        for (const song of recommendation.songs) {
          if (!addedSongs.has(song)) {
            mergedRecommendations.songs.push(song);
            addedSongs.add(song);
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
