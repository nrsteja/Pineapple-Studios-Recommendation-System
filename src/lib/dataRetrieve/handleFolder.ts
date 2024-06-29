import {
  getFolderById,
  toggleIsSeries,
  updateFolderName,
} from "../database/folder";
import {getItemById} from "../database/item";
import {
  createItemsInFolders,
  deleteItemInFolderAssignment,
  isItemInFolder,
} from "../database/itemsInFolders";
import {prismaClient} from "../database/prisma";
import {deleteRecentItemAssignments} from "../database/recentItems";
import {getUserById} from "../database/user";
import {addHistoryItemForUser} from "./handleUserInfo";

const prisma = prismaClient;

export async function updateFolderWithNewName(
  folderId: number,
  newFolderName: string,
) {
  const folder = await getFolderById(folderId);
  if (!folder) {
    console.error("Folder is not existing");
    return;
  }

  await updateFolderName(folderId, newFolderName);
  console.log("Folder name updated");
}

export async function addItemToFolderOrSeries(
  userId: number,
  folderId: number,
  itemId: number,
) {
  try {
    // Check if the folder exists in the library
    const user = await getUserById(userId);
    if (!user) {
      console.error("User is not exist");
      return false;
    }

    const item = await getItemById(itemId);
    if (!item) {
      console.error("Item is not exit");
      return false;
    }

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        libraryId: user.libraryId,
      },
    });

    if (!folder) {
      console.log(
        `Folder with ID ${folderId} does not exist in the library with ID ${user.libraryId}`,
      );
      return false;
    }

    // Add the item to the folder
    const data = {
      body: {
        folderId: folder.id,
        itemId: item.id,
      },
    };
    const existingInFolder = await isItemInFolder(folder.id, item.id);
    if (existingInFolder) {
      console.log("Item is already existing in the folder");
      return false;
    }

    await createItemsInFolders(data);
    await addHistoryItemForUser(userId, itemId);
    // await createRecentItemAssignments(itemId, userId);
    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error adding item to folder:", error);
    return false;
  }
}

export async function removeItemFromFolderOrSeries(
  userId: number,
  folderId: number,
  itemId: number,
) {
  try {
    // Check if the folder exists in the library
    const user = await getUserById(userId);
    if (!user) {
      console.error("User is not exist");
      return false;
    }

    const item = await getItemById(itemId);
    if (!item) {
      console.error("Item is not exsit");
      return false;
    }

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        libraryId: user.libraryId,
      },
    });

    if (!folder) {
      console.log(
        `Folder with ID ${folderId} does not exist in the library with ID ${user.libraryId}`,
      );
      return false;
    }

    const existingInFolder = await isItemInFolder(folder.id, item.id);
    if (!existingInFolder) {
      console.log("Item is NOT exsiting in the folder");
      return false;
    }

    await deleteItemInFolderAssignment(folder.id, item.id);
    await deleteRecentItemAssignments(itemId, userId);
    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error removing item to folder:", error);
    return false;
  }
}

export async function setFolderToSeries(folderId: number) {
  const folder = await getFolderById(folderId);
  if (folder?.isSeries) {
    return {error: 'The folder for", folderId , "is ALREADY a series'};
  }

  await toggleIsSeries(folderId);
  console.log("The folder with folder Id: ", folderId, "is a series now");
}

export async function unSetFolderFromSeries(folderId: number) {
  const folder = await getFolderById(folderId);
  if (!folder?.isSeries) {
    return {error: 'The folder for", folderId , "is ALREADY NOT a series'};
  }

  await toggleIsSeries(folderId);
  console.log("The folder with folder Id: ", folderId, "is not a series now");
}
