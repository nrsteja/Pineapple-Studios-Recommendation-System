import {getItemById} from "../database/item";
import {isItemInLibrary} from "../database/itemsInLibraries";
import {prismaClient} from "../database/prisma";
import {
  createRecentItemAssignments,
  deleteRecentItemAssignments,
  getRecentItemAddedByUser,
} from "../database/recentItems";
import {removeItemFromFavourite} from "./handleItemTag";

const prisma = prismaClient;

export async function addItemToLibrary(userId: number, itemId: number) {
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
        id: user.libraryId,
      },
    });

    if (!library) {
      console.log(`Library with ID ${user.libraryId} does not exist.`);
      return false;
    }
    const itemCheck = await isItemInLibrary(user.libraryId, itemId);

    if (itemCheck) {
      console.log(`Item with ID ${itemId} Already exist in library.`);
      return false;
    }
    // Add the item to the library
    await prisma.itemsInLibraries.create({
      data: {
        libraryId: user.libraryId,
        itemId: itemId, // Use the provided item ID
      },
    });
    await createRecentItemAssignments(itemId, userId);

    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error adding item to library:", error);
    return false;
  }
}

export async function removeItemFromLibrary(userId: number, itemId: number) {
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
        id: user.libraryId,
      },
    });

    if (!library) {
      console.log(`Library with ID ${user.libraryId} does not exist.`);
      return false;
    }

    // Check if the item exists in the library
    const itemInLibrary = await prisma.itemsInLibraries.findFirst({
      where: {
        libraryId: user.libraryId,
        itemId: itemId,
      },
    });

    if (!itemInLibrary) {
      console.log(`Item with ID ${itemId} is not in the library.`);
      return false;
    }

    // Remove the item from the library
    await prisma.itemsInLibraries.delete({
      where: {
        libraryId_itemId: {
          libraryId: user.libraryId,
          itemId: itemId,
        },
      },
    });

    await removeItemFromFavourite(userId, itemId);
    await deleteRecentItemAssignments(itemId, userId);
    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error removing item from library:", error);
    return false;
  }
}
//return a list of string (item's titles)
export async function getRecentItemsFromLibrary(userId: number) {
  let itemTitles: string[] = [];
  const assignments = await getRecentItemAddedByUser(userId);
  if (!assignments) {
    console.log("Items in library library is too less");
  } else {
    for (const assingment of assignments) {
      if (assingment) {
        const item = await getItemById(assingment.itemId);
        if (item) itemTitles.push(item.title);
      }
    }
  }
  return itemTitles;
}
