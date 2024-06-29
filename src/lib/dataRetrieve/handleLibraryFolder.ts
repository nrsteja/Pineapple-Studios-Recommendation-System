import {deleteFolderById, getFolderById} from "../database/folder";
import {
  deleteItemInFolderAssignment,
  getAllItemsInFolder,
} from "../database/itemsInFolders";
import {prismaClient} from "../database/prisma";
import {getUserById} from "../database/user";

const prisma = prismaClient;

export async function addFolderToLibrary(
  userId: number,
  libraryId: number,
  folderId: number,
) {
  try {
    // Fetch the user to ensure it exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      console.log(`User with ID ${userId} does not exist.`);
      return false;
    }

    // Fetch the library to ensure it exists
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId,
      },
    });

    if (!library) {
      console.log(`Library with ID ${libraryId} does not exist.`);
      return false;
    }

    // Fetch the folder to ensure it exists
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });

    if (!folder) {
      console.log(`Folder with ID ${folderId} does not exist.`);
      return false;
    }

    // Add the folder to the library
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        Library: {
          connect: {
            id: libraryId,
          },
        },
      },
    });

    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error adding folder to library:", error);
    return false;
  }
}

export async function removeFolderFromLibrary(
  userId: number,
  libraryId: number,
  folderId: number,
) {
  try {
    // Fetch the user to ensure it exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      console.log(`User with ID ${userId} does not exist.`);
      return false;
    }

    // Fetch the library to ensure it exists
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId,
      },
    });

    if (!library) {
      console.log(`Library with ID ${libraryId} does not exist.`);
      return false;
    }

    // Check if the folder exists in the library
    const folderInLibrary = await prisma.folder.findFirst({
      where: {
        id: folderId,
        libraryId: libraryId,
      },
    });

    if (!folderInLibrary) {
      console.log(`Folder with ID ${folderId} is not in the library.`);
      return false;
    }

    // Remove the folder from the library
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        Library: {
          disconnect: true,
        },
      },
    });

    const itemsInFolder = await getAllItemsInFolder(folderId);
    if (itemsInFolder) {
      for (const item of itemsInFolder) {
        if (item) await deleteItemInFolderAssignment(folderId, item?.id); //delete all the assignment of item in folder
      }
    }

    //Lastly delete the folder
    await deleteFolderById(folderId);

    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error removing folder from library:", error);
    return false;
  }
}

export async function addSeriesToLibrary(userId: number, folderId: number) {
  try {
    // Fetch the user to ensure it exists
    const user = await getUserById(userId);

    if (!user) {
      console.log(`User with ID ${userId} does not exist.`);
      return false;
    }

    // Fetch the folder to ensure it exists
    const folderCheck = await getFolderById(folderId);
    if (!folderCheck) {
      console.log(`Folder with ID ${folderId} does not exist.`);
      return false;
    } else {
      if (!folderCheck.isSeries) {
        console.log("The folder with ID ", folderId, " is not a series");
        return false;
      }
    }

    // Add the series to the library
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        Library: {
          connect: {
            id: user.libraryId,
          },
        },
      },
    });

    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error adding folder to library:", error);
    return false;
  }
}

export async function removeSeriesFromLibrary(
  userId: number,
  folderId: number,
) {
  try {
    // Fetch the user to ensure it exists
    const user = await getUserById(userId);

    if (!user) {
      console.log(`User with ID ${userId} does not exist.`);
      return false;
    }

    // Fetch the folder to ensure it exists
    const folderCheck = await getFolderById(folderId);
    if (!folderCheck) {
      console.log(`Folder with ID ${folderId} does not exist.`);
      return false;
    } else {
      if (!folderCheck.isSeries) {
        console.log("The folder with ID ", folderId, " is not a series");
        return false;
      }
    }

    // remove the series from the library
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        Library: {
          disconnect: true,
        },
      },
    });
    const itemsInFolder = await getAllItemsInFolder(folderId);
    if (itemsInFolder) {
      for (const item of itemsInFolder) {
        if (item) await deleteItemInFolderAssignment(folderId, item?.id); //delete all the assignment of item in folder
      }
    }

    //Lastly delete the folder
    await deleteFolderById(folderId);

    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error removing series to library:", error);
    return false;
  }
}
