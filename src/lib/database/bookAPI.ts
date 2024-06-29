import {createBook, getBookBySrcId} from "./book";
import {createItem} from "./item";
import {createPeople, getPeopleByNameAndRole} from "./people";
import {createPeopleinItemsAssignments} from "./peopleInItems";

export const createBookItem = async (singleBookData: any) => {
  //sanity check
  if (singleBookData == null) {
    console.log("Empty Single Book Data.");
    return null;
  }

  const bookCheck = await getBookBySrcId(singleBookData.srcId);
  if (bookCheck) {
    console.log("Book Already Exist in database.");
    return bookCheck;
  }

  //Create people object (authors)
  let peopleArray: any[] = [];
  if (singleBookData.authors.length > 0 && singleBookData.authors !== "N/A") {
    for (const authorName of singleBookData.authors) {
      // Check if author already exists
      const existingPeople = await getPeopleByNameAndRole(authorName, "author");
      if (!existingPeople) {
        // Create author if not exists
        const personData = {
          body: {
            name: authorName,
            role: "author",
          },
        };
        const createdPeople = await createPeople(personData);
        peopleArray.push(createdPeople);
      } else {
        peopleArray.push(existingPeople);
      }
    }
  }

  //Create item object
  const itemData = {
    body: {
      image: singleBookData.thumbnailUrl,
      itemType: "book",
      title: singleBookData.itemTitle,
      genre: singleBookData.genre,
      language: singleBookData.language,
      publishedDate: singleBookData.publishedDate,
      avgRate: parseFloat(singleBookData.averageRating) / 2,
    },
  };

  const item = await createItem(itemData);
  if (!item) {
    console.log("Fail to create item");
    return null;
  }

  //check if there are any people (authors) found or created
  if (peopleArray.length != 0) {
    //only create People & item assignment when there are any people (authors)
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
      "people(s) found/created and assignment people(s) and item created.",
    );
  } else {
    console.log("No people found/created.");
  }

  //create Book object
  const bookData = {
    body: {
      srcId: singleBookData.srcId,
      pages: singleBookData.pages,
      itemId: item.id,
      description: singleBookData.description,
    },
  };

  const book = await createBook(bookData);
  return {
    item,
    book,
  };
};
