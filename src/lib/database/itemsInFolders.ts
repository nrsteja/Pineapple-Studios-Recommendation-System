import {getItemById} from "./item";
import {prismaClient} from "./prisma";

export const createItemsInFolders = async (request: any) => {
  try {
    const assignmentData = request.body;
    const assignment = await prismaClient.itemsInFolders.create({
      data: assignmentData,
    });
    return assignment;
  } catch (error) {
    console.error("Error occurred while creating Items in Folder:", error);
  }
};

export const countItemsInFolder = async (folderId: number) => {
  try {
    const count = await prismaClient.itemsInFolders.count({
      where: {
        folderId: folderId,
      },
    });
    return count;
  } catch (error) {
    // Handle any errors here
    console.error("Error counting items in folder:", error);
    return 0;
  }
};

export const isItemInFolder = async (
  folderId: number,
  itemId: number,
): Promise<boolean> => {
  try {
    // Query the database to find the item in the folder
    const itemInFolder = await prismaClient.itemsInFolders.findFirst({
      where: {
        folderId: folderId,
        itemId: itemId,
      },
    });

    // If itemInFolder is null, the item does not exist in the folder
    if (itemInFolder === null) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error checking if item is in folder:", error);
    return false;
  }
};

export const deleteItemInFolderAssignment = async (
  folderId: number,
  itemId: number,
) => {
  try {
    await prismaClient.itemsInFolders.deleteMany({
      where: {
        folderId: folderId,
        itemId: itemId,
      },
    });
  } catch (error) {
    // Handle any errors here
    console.error("Error deleting item in folder:", error);
  }
};

export const getAllItemsInFolder = async (folderId: number) => {
  try {
    const itemAssignments = await prismaClient.itemsInFolders.findMany({
      where: {
        folderId: folderId,
      },
    });

    const itemIds = itemAssignments.map((assigment) => assigment.itemId);
    const allItemsInFolder = await Promise.all(
      itemIds.map((itemId) => getItemById(itemId)),
    );
    return allItemsInFolder;
  } catch (error) {
    console.error("Error Occured when getting all items in a folder", error);
  }
};
