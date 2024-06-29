import {createItem} from "./item";
import {createMovie, getMovieBySrcId} from "./movie";
import {createPeople, getPeopleByNameAndRole} from "./people";
import {createPeopleinItemsAssignments} from "./peopleInItems";

export const createMovieItem = async (singleMovieData: any) => {
  // Sanity check
  if (singleMovieData == null) {
    console.log("Empty Single Movie Data.");
    return null;
  }

  const movieCheck = await getMovieBySrcId(singleMovieData.srcId);
  if (movieCheck) {
    console.log("Movie Already Exists in the database.");
    return movieCheck;
  }

  // Create people object (cast)
  let peopleArray: any[] = [];
  if (singleMovieData.actors && singleMovieData.actors !== "N/A") {
    // Split the actors string into an array of actor names
    const actorNames = singleMovieData.actors.split(", ");
    for (const actorName of actorNames) {
      // Check if cast member already exists
      const existingPeople = await getPeopleByNameAndRole(actorName, "actor");
      if (!existingPeople) {
        // Create cast member if not exists
        const personData = {
          body: {
            name: actorName,
            role: "actor",
          },
        };
        const createdPeople = await createPeople(personData);
        peopleArray.push(createdPeople);
      } else {
        peopleArray.push(existingPeople);
      }
    }
  }

  // Create item object
  const itemData = {
    body: {
      image: singleMovieData.thumbnailUrl,
      itemType: "movie",
      title: singleMovieData.itemTitle,
      genre: singleMovieData.genre,
      language: singleMovieData.language,
      publishedDate: singleMovieData.releaseDate,
      avgRate: parseFloat(singleMovieData.averageRating) / 2,
    },
  };

  const item = await createItem(itemData);
  if (!item) {
    console.log("Failed to create item");
    return null;
  }

  // Check if there are any people (cast) found or created
  if (peopleArray.length != 0) {
    // Only create People & item assignment when there are any people (cast)
    // found or created
    for (const person of peopleArray) {
      const assignmentData = {
        body: {
          peopleId: person.id,
          itemId: item.id,
        },
      };
      await createPeopleinItemsAssignments(assignmentData);
    }
    console.log(
      "Cast member(s) found/created and assigned cast member(s) and item created.",
    );
  } else {
    console.log("No cast members found/created.");
  }

  // Create Movie object
  const movieData = {
    body: {
      srcId: singleMovieData.srcId,
      duration: singleMovieData.duration,
      itemId: item.id,
      description: singleMovieData.description,
    },
  };

  const movie = await createMovie(movieData);
  //if (movie == null) return null;
  //else if (movie == '1') return '2';
  //else
  return {
    movieData,
    item,
    movie,
  };
};
