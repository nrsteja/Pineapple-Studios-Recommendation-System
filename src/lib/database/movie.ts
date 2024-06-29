//http://www.omdbapi.com/?s=star wars&apikey=411ddaa2
import {deleteItem} from "./item";
import {prismaClient} from "./prisma";

//CRUD

//CRUD
//getAllMovies
export const getAllMovies = async () => {
  try {
    const allMovies = await prismaClient.movie.findMany({
      include: {
        item: true, //also get all movieItem
      },
    });
    return allMovies;
  } catch (e) {
    console.log(e);
  }
};
export const getMovieBySrcId = async (sourceId: any) => {
  try {
    const movie = await prismaClient.movie.findUnique({
      where: {
        srcId: sourceId,
      },
      include: {
        item: true,
      },
    });
    return movie;
  } catch (e) {
    console.log(e);
  }
};

//getMovieByItemId
export const getMovieByItemId = async (movieId: any) => {
  try {
    const movie = await prismaClient.movie.findUnique({
      where: {
        itemId: movieId, //id equals to movieid
      },
      include: {
        item: true,
      },
    });
    return movie;
  } catch (e) {
    console.log(e);
  }
};

//createMovie
// export const createMovie = async (reqMovie: any, reqItem: any) => {
//   try {
//     const movieData = reqMovie.body; //contain all movie's data for a movie
//     const itemData = reqItem.body;
//     const movie = await prismaClient.movie.create({
//       data: movieData,
//     });
//     const item = await createItem(itemData);
//     return {movie, item};
//   } catch (error) {
//     console.error("Error occurred while creating movie:", error);
//   }
// };

// createBook
export const createMovie = async (reqMovie: any) => {
  try {
    const movieData = reqMovie.body;

    const movie = await prismaClient.movie.create({
      data: movieData,
    });
    //if(movie == null) return '1';
    return movie; // Return item and book
  } catch (e) {
    console.error("Error occurred while creating book:", e);
    return null;
  }
};

//updateMovie
export const updateMovie = async (request: any) => {
  try {
    const movieId = request.params.itemId;
    const movieData = request.body; //contain all movie's data for a movie

    // Remove movieId from movieData to prevent updating it
    delete movieData.itemId;
    delete movieData.item;
    delete movieData.srcId;
    const movie = await prismaClient.movie.update({
      where: {
        itemId: movieId,
      },
      data: movieData,
    });
    return movie;
  } catch (e) {
    console.log(e);
  }
};

//deleteMovie
export const deleteMovie = async (request: any) => {
  try {
    const movieId = request.params.itemId; //contain all movie's data for a movie
    let result = await deleteItem(movieId); // Await the deleteItem function directly
    if (result) {
      await prismaClient.movie.delete({
        where: {
          itemId: movieId,
        },
      });
      return {success: true};
    } else {
      return {success: false, error: "Unable to delete item"};
    }
  } catch (e) {
    console.log(e);
    return {success: false};
  }
};

// const [movies, setMovies] = useState([]);

// export const getMovieRequest = async (searchValue: any) => {
//   const url = "http://www.omdbapi.com/?s=${searchValue}&apikey=411ddaa2";
//   const response = await fetch(url);
//   const responseJson = await response.json();

//   if (responseJson.Search) {
//     setMovies(responseJson.Search);
//   }
// };
export const getMovieRequest = async (searchValue: string) => {
  const url = `http://www.omdbapi.com/?s=${encodeURIComponent(
    searchValue,
  )}&apikey=1384299c`;
  try {
    const response = await fetch(url);
    const responseJson = await response.json();

    if (responseJson.Search) {
      // Extract movie information from response data
      const moviesData: any[] = responseJson.Search.map((item: any) => ({
        itemTitle: item.Title,
        // Add other properties of a movie as needed
      }));
      return moviesData;
    } else {
      console.error("No movies found.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

// export const getMovieDetailsRequest = async (searchValue: string) => {
//   const url = `http://www.omdbapi.com/?t=${encodeURIComponent(
//     searchValue,
//   )}&apikey=411ddaa2`;
//   try {
//     const response = await fetch(url);
//     const responseData = await response.json();

//     if (responseData.items) {
//       // Extract movie information from response data
//       const movieData: any[] = responseData.items.map((item: any) => ({
//           srcId: item.id,
//           actors: item.volumeInfo.Actors ? item.volumeInfo.Actors : "N/A",
//           itemTitle: item.volumeInfo.Title,
//           thumbnailUrl: item.volumeInfo.Poster || "N/A",
//           genre: item.volumeInfo.Genre || "N/A",
//           language: item.volumeInfo.Language || "N/A",
//           averageRating: item.volumeInfo.imdbRating || "N/A",
//           ratingsCount: item.volumeInfo.imdbVotes || "N/A",
//           year: item.volumeInfo.Year || "N/A", // Add year
//           duration: item.volumeInfo.Runtime || "N/A", // Add duration
//           releaseDate: item.volumeInfo.Released || "N/A"
//           // Add other properties of a movie as needed
//         }));
//       return movieData;
//     } else {
//       console.error("Movie not found.");
//       return ["Sorry"];
//     }
//   } catch (error) {
//     console.error("Error fetching movie:", error);
//     return [];
//   }
// };
// api key = 411ddaa2
// api key = 380dd9ef
// api key = 1384299c
export const getMovieDetailsRequest = async (searchValue: string) => {
  const url = `http://www.omdbapi.com/?s=${encodeURIComponent(
    searchValue,
  )}&apikey=1384299c&type=movie`;

  try {
    const response = await fetch(url);
    const responseData = await response.json();

    if (responseData.Search) {
      const movieData: any[] = [];
      for (const movie of responseData.Search.slice(0, 10)) {
        const detailResponse = await fetch(
          `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=1384299c`,
        );
        const detailData = await detailResponse.json();

        const runtimeMatch = detailData.Runtime.match(/\d+/); // Extract numeric part from the string
        const duration = runtimeMatch ? parseInt(runtimeMatch[0]) : 0; // Convert the numeric part to an integer

        movieData.push({
          srcId: "movie+" + movie.imdbID,
          actors: detailData.Actors || "N/A",
          itemTitle: movie.Title,
          thumbnailUrl: movie.Poster === "N/A" ? "N/A" : movie.Poster,
          genre: detailData.Genre || "N/A",
          language: detailData.Language || "N/A",
          averageRating: detailData.imdbRating || "N/A",
          description: detailData.Plot,
          ratingsCount: detailData.imdbVotes || "N/A",
          year: movie.Year,
          duration: duration, // Store duration as an integer
          releaseDate: detailData.Released || "N/A",
          // Add other properties of a movie as needed
        });
      }

      return movieData;
    } else {
      console.error("Movies not found.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const getMovieDetailsRequestById = async (srcId: string) => {
  //Split the input
  const parts = srcId.split("+");
  const id = parts[1];
  const url = `http://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=1384299c`;

  try {
    const response = await fetch(url);
    const responseData = await response.json();

    if (response.ok) {
      const runtimeMatch = responseData.Runtime?.match(/\d+/); // Optional chaining
      const duration = runtimeMatch ? parseInt(runtimeMatch[0]) : 0;

      const movieData = {
        srcId: id,
        actors: responseData.Actors ?? "N/A",
        itemTitle: responseData.Title,
        thumbnailUrl:
          responseData.Poster === "N/A" ? "N/A" : responseData.Poster,
        genre: responseData.Genre ?? "N/A",
        language: responseData.Language ?? "N/A",
        averageRating: responseData.imdbRating ?? "N/A",
        description: responseData.Plot,
        ratingsCount: responseData.imdbVotes ?? "N/A",
        year: responseData.Year,
        duration: duration,
        releaseDate: responseData.Released ?? "N/A",
        // Add other properties of a movie as needed
      };

      return movieData;
    } else {
      console.error("Movie details not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

// // Rate a movie by ID using a raw SQL query
// export const rateMovie = async (movieId: number, rating: number) => {
//   try {
//     // Execute a raw SQL query to update the rating of the movie
//     await prismaClient.$executeRaw`UPDATE "Movie" SET "rate" = ${rating} WHERE "id" = ${movieId}`;

//     // Retrieve the updated movie
//     const updatedMovie = await prismaClient.movie.findUnique({
//       where: {
//         id: movieId,
//       },
//     });

//     if (!updatedMovie) {
//       throw new Error('Failed to retrieve updated movie');
//     }

//     return updatedMovie;
//   } catch (error) {
//     console.error("Failed to rate movie:", error);
//     throw new Error("Failed to rate movie");
//   }
// };
// // Add a review to a movie using a raw SQL query
// export const addMovieReview = async (movieId: number, review: string) => {
//   try {
//     // Execute a raw SQL query to update the review of the movie
//     await prismaClient.$executeRaw`UPDATE "Movie" SET "review" = ${review} WHERE "id" = ${movieId}`;

//     // Retrieve the updated movie
//     const updatedMovie = await prismaClient.movie.findUnique({
//       where: {
//         id: movieId,
//       },
//     });

//     if (!updatedMovie) {
//       throw new Error('Failed to retrieve updated movie');
//     }

//     return updatedMovie;
//   } catch (error) {
//     console.error("Failed to add review to movie:", error);
//     throw new Error("Failed to add review to movie");
//   }
// };
