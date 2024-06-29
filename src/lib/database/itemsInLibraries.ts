import {prismaClient} from "./prisma";

export const createItemsInLibrariesAssignment = async (request: any) => {
  try {
    const assignmentData = request.body;
    const assignment = await prismaClient.peopleInItems.create({
      data: assignmentData,
    });
    return assignment;
  } catch (error) {
    console.error("Error occurred while creating Items in Library:", error);
  }
};

export const countItemsInLibrary = async (libraryId: number) => {
  try {
    const count = await prismaClient.itemsInLibraries.count({
      where: {
        libraryId: libraryId,
      },
    });
    return count;
  } catch (error) {
    // Handle any errors here
    console.error("Error counting items in library:", error);
    return 0;
  }
};

export const isItemInLibrary = async (
  libraryId: number,
  itemId: number,
): Promise<boolean> => {
  try {
    // Query the database to find the item in the library
    const itemInLibrary = await prismaClient.itemsInLibraries.findFirst({
      where: {
        libraryId: libraryId,
        itemId: itemId,
      },
    });

    // If itemInLibrary is null, the item does not exist in the library
    if (itemInLibrary === null) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error checking if item is in library:", error);
    return false;
  }
};
