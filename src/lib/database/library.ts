import {prismaClient} from "./prisma";

// get Library By Id
export const getLiraryById = async (request: any) => {
  try {
    const libraryId = request.params.id;
    const library = await prismaClient.library.findUnique({
      where: {
        id: libraryId,
      },
    });
    return library;
  } catch (e) {
    console.log(e);
  }
};

// create library
export const createLibrary = async () => {
  try {
    // const libraryData = request.body;

    // Create the library
    const library = await prismaClient.library.create({
      //  data: libraryData,
    });

    return library;
  } catch (error) {
    console.error("Error occurred while creating library:", error);
  }
};

// update library
export const updateLibrary = async (request: any) => {
  try {
    const libraryId = request.params.id;
    const libraryData = request.body;
    // Remove songId from songData to prevent updating it
    delete libraryData.itemId;
    delete libraryData.user;

    const library = await prismaClient.library.update({
      where: {
        id: libraryId,
      },
      data: libraryData,
    });
    return library;
  } catch (e) {
    console.log(e);
  }
};

// delete library
export const deleteLibrary = async (request: any) => {
  try {
    const libraryId = request.params.id;
    //Need to delete folders also
    await prismaClient.library.delete({
      where: {
        id: libraryId,
      },
    });
    return {success: true};
  } catch (e) {
    console.log(e);
    return {success: false};
  }
};
