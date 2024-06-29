import {prismaClient} from "./prisma";

// getAllBooks
export const getAllBooks = async () => {
  try {
    const allBooks = await prismaClient.book.findMany({
      include: {
        item: true, // Include the associated Item data
      },
    });
    return allBooks;
  } catch (e) {
    console.log(e);
  }
};

// getBookBySrcId
export const getBookBySrcId = async (sourceId: any) => {
  try {
    const book = await prismaClient.book.findUnique({
      where: {
        srcId: sourceId,
      },
      include: {
        item: true,
      },
    });
    return book;
  } catch (e) {
    console.log(e);
  }
};

// getBookById
export const getBookByItemId = async (itemId: any) => {
  try {
    const book = await prismaClient.book.findUnique({
      where: {
        itemId: itemId,
      },
      include: {
        item: true,
      },
    });
    return book;
  } catch (e) {
    console.log(e);
  }
};

// createBook
export const createBook = async (reqBook: any) => {
  try {
    const bookData = reqBook.body;
    const book = await prismaClient.book.create({
      data: bookData,
    });
    return book; // Return item and book
  } catch (e) {
    console.error("Error occurred while creating book:", e);
    return null;
  }
};

// updateBook
export const updateBook = async (request: any) => {
  try {
    const bookId = request.params.itemId;
    const bookData = request.body;
    // Remove bookId from bookData to prevent updating it
    delete bookData.itemId;
    delete bookData.item;
    delete bookData.srcId;

    const book = await prismaClient.book.update({
      where: {
        itemId: bookId,
      },
      data: bookData,
    });
    return book;
  } catch (e) {
    console.log(e);
  }
};

// deleteBook
export const deleteBook = async (request: any) => {
  try {
    const bookId = request.params.itemId;
    await prismaClient.book.delete({
      where: {
        itemId: bookId,
      },
    });
    return {success: true};
  } catch (e) {
    console.log(e);
    return {success: false};
  }
};

export const getBookRequest = async (searchValue: string) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    searchValue,
  )}`;
  try {
    const response = await fetch(url);
    const responseData = await response.json();

    if (responseData.items) {
      // Extract book information from response data
      const booksData: any[] = responseData.items.map((item: any) => ({
        itemTitle: item.volumeInfo.title,
        // Add other properties of a book as needed
      }));
      return booksData;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

export const getBookDetailsRequest = async (searchValue: string) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    searchValue,
  )}`;
  try {
    const response = await fetch(url);
    const responseData = await response.json();

    if (responseData.items) {
      // Extract book information from response data
      const booksData: any[] = responseData.items.map((item: any) => ({
        srcId: "book+" + item.id,
        pages:
          item.volumeInfo.pageCount != 0
            ? item.volumeInfo.pageCount
            : undefined,
        itemTitle: item.volumeInfo.title,
        thumbnailUrl: item.volumeInfo.imageLinks
          ? item.volumeInfo.imageLinks.thumbnail
          : "N/A", // Extract thumbnail URL
        genre: item.volumeInfo.categories
          ? item.volumeInfo.categories.join(", ")
          : "N/A",
        language: item.volumeInfo.language || "N/A",
        averageRating: item.volumeInfo.averageRating || "N/A",
        description: item.volumeInfo.description,
        ratingsCount: item.volumeInfo.ratingsCount || "N/A",
        authors: item.volumeInfo.authors ? item.volumeInfo.authors : "N/A",
        publishedDate: item.volumeInfo.publishedDate || "N/A",
        year: item.volumeInfo.Year || "N/A", // Add year
        // Add other properties of a book as needed
      }));
      return booksData;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

export const getBookDetailsRequestById = async (srcId: string) => {
  //Split the input
  const parts = srcId.split("+");
  const id = parts[1];

  const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`;
  try {
    const response = await fetch(url);
    const responseData = await response.json();

    if (response.ok && responseData.id) {
      const item = responseData;

      const bookData = {
        srcId: id,
        pages:
          item.volumeInfo.pageCount != 0
            ? item.volumeInfo.pageCount
            : undefined,
        itemTitle: item.volumeInfo.title,
        thumbnailUrl: item.volumeInfo.imageLinks
          ? item.volumeInfo.imageLinks.thumbnail
          : "N/A",
        genre: item.volumeInfo.categories
          ? item.volumeInfo.categories.join(", ")
          : "N/A",
        language: item.volumeInfo.language || "N/A",
        averageRating: item.volumeInfo.averageRating || "N/A",
        description: item.volumeInfo.description,
        ratingsCount: item.volumeInfo.ratingsCount || "N/A",
        authors: item.volumeInfo.authors ? item.volumeInfo.authors : "N/A",
        publishedDate: item.volumeInfo.publishedDate || "N/A",
        year: item.volumeInfo.publishedDate
          ? new Date(item.volumeInfo.publishedDate).getFullYear()
          : "N/A",
        // Add other properties of a book as needed
      };

      return bookData;
    } else {
      console.error("Book details not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};

// // Add a review to a book
// export const addBookReview = async (bookId: number, review: String) => {
//   try {
//     // Check if the book exists
//     const book = await prismaClient.book.findUnique({
//       where: {
//         id: bookId,
//       },
//     });

//     if (!book) {
//       throw new Error('Book not found');
//     }

//     // Add the review to the book
//     const updatedBook = await prismaClient.book.update({
//       where: {
//         id: bookId,
//       },
//       data: {
//         review: review,
//       },
//     });

//     return updatedBook;
//   } catch (error) {
//     console.error("Failed to add review to book:", error);
//     throw new Error("Failed to add review to book");
//   }
// };
