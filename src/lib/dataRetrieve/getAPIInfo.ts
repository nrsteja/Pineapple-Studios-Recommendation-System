import {getBookDetailsRequest} from "../database/book";
import {getMovieDetailsRequest} from "../database/movie";
import {getSongDetailsRequest} from "../database/song";

export const getSearchAPI = async (searchValue: string): Promise<any[]> => {
  try {
    // Fetch data for books, movies, and songs
    const [books, movies, songs] = await Promise.all([
      getBookDetailsRequest(searchValue),
      getMovieDetailsRequest(searchValue),
      getSongDetailsRequest(searchValue),
    ]);

    // Return a list containing details for 10 items of each category
    return [
      ...books.slice(0, 10),
      ...movies.slice(0, 10),
      ...songs.slice(0, 10),
    ];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
};

// Function to handle search for books, return 10 books data from API
export const handleBookSearchAPI = async (
  searchValue: string,
): Promise<any[]> => {
  try {
    // Fetch book details
    const books = await getBookDetailsRequest(searchValue);
    // Return the first 10 items
    return books.slice(0, 10);
  } catch (error) {
    console.error("Error fetching book search results:", error);
    return [];
  }
};

// Function to handle search for movies, return 10 movies data from API
export const handleMovieSearchAPI = async (
  searchValue: string,
): Promise<any[]> => {
  try {
    // Fetch movie details
    const movies = await getMovieDetailsRequest(searchValue);
    // Return the first 10 items
    return movies.slice(0, 10);
  } catch (error) {
    console.error("Error fetching movie search results:", error);
    return [];
  }
};

// Function to handle search for songs, return 10 songs data from API
export const handleSongSearchAPI = async (
  searchValue: string,
): Promise<any[]> => {
  try {
    // Fetch song details
    const songs = await getSongDetailsRequest(searchValue);
    // Return the first 10 items
    return songs.slice(0, 10);
  } catch (error) {
    console.error("Error fetching song search results:", error);
    return [];
  }
};
