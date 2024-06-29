import {prismaClient} from "./prisma";

// Create a new folder
export const createFolder = async (name: string, libraryId: number) => {
  try {
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
    console.error("Error occurred while creating folder:", error);
    return null;
  }
};

// Get folder by ID
export const getFolderById = async (folderId: number) => {
  try {
    const folder = await prismaClient.folder.findUnique({
      where: {
        id: folderId,
      },
    });
    return folder;
  } catch (error) {
    console.error("Error occurred while fetching folder by ID:", error);
    return null;
  }
};

// Update folder name
export const updateFolderName = async (folderId: number, name: string) => {
  try {
    const updatedFolder = await prismaClient.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name: name,
      },
    });
    return updatedFolder;
  } catch (error) {
    console.error("Error occurred while updating folder:", error);
  }
};

// Toggle folder's isseries
export const toggleIsSeries = async (folderId: number) => {
  try {
    const folder = await getFolderById(folderId);
    let newValue;
    if (folder?.isSeries == false) newValue = true;
    else newValue = false;
    const updatedFolder = await prismaClient.folder.update({
      where: {
        id: folderId,
      },
      data: {
        isSeries: newValue,
      },
    });
    return updatedFolder;
  } catch (error) {
    console.error("Error occurred while updating folder:", error);
  }
};

// Delete folder by ID
export const deleteFolderById = async (folderId: number) => {
  try {
    await prismaClient.folder.delete({
      where: {
        id: folderId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error occurred while deleting folder by ID:", error);
    return false;
  }
};

// Get folder by name within a specific library
export const getFolderByName = async (name: string, libraryId: number) => {
  try {
    const folder = await prismaClient.folder.findFirst({
      where: {
        name: name,
        libraryId: libraryId,
      },
    });
    return folder;
  } catch (error) {
    console.error("Error occurred while fetching folder by name:", error);
    return null;
  }
};
