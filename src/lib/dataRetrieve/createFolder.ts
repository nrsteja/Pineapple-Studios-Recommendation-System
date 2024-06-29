import {getFolderByName} from "../database/folder";
import {prismaClient} from "../database/prisma";
import {getUserById} from "../database/user";

export const createFolder = async (name: string, userId: number) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      console.log("User for userId: ", userId, " is invalid!");
      throw new Error(`User with ID ${userId} not found`);
    }

    const libraryId = user.libraryId;

    // Check if a folder with the same name already exists in the library
    const existingFolder = await getFolderByName(name, libraryId);
    if (existingFolder) {
      // throw new Error(
      //   "Folder with the same name already exists in the library.",
      // );
      console.error(
        "Error occurred while handling folder:",
        "Folder with the same name already exists in the library.",
      );
      return null;
    }

    // If no existing folder found, create a new folder
    const newFolder = await prismaClient.folder.create({
      data: {
        name: name,
        Library: {
          connect: {
            id: libraryId,
          },
        },
      },
    });
    return newFolder;
  } catch (error) {
    console.error("Error occurred while handling folder:", error);
    return null;
  }
};
export const deleteFolder = async (folderId: number, userId: number) => {
  try {
    // Check if the folder exists and belongs to the user
    const folder = await prismaClient.folder.findFirst({
      where: {
        AND: [
          {id: folderId},
          {Library: {user: {id: userId}}}, // Ensure the folder belongs to the
          // userr
        ],
      },
    });

    if (!folder) {
      console.error(`Folder with ID ${folderId} not found.`);
      return null;
    }

    // Delete associated items in the folder
    await prismaClient.itemsInFolders.deleteMany({
      where: {folderId},
    });

    // Delete the folder
    const deletedFolder = await prismaClient.folder.delete({
      where: {id: folderId},
    });

    return deletedFolder;
  } catch (error) {
    console.error("Error occurred while deleting folder:", error);
    return null;
  }
};
