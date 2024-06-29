import {prismaClient} from "./prisma";

//CRUD

//get all tags
export const getAllTags = async () => {
  try {
    const allTags = await prismaClient.tag.findMany();
    return allTags;
  } catch (e) {
    console.log(e);
  }
};

//get tag by Id
export const getTagById = async (tagId: number) => {
  try {
    const tag = await prismaClient.tag.findUnique({
      where: {
        id: tagId,
      },
    });
    return tag;
  } catch (e) {
    console.log(e);
  }
};

//get tag by tag name
export const getTagByNameAndUserIdAndItemId = async (
  tagName: string,
  userId: number,
  itemId: number,
) => {
  try {
    const tag = await prismaClient.tag.findFirst({
      where: {
        name: tagName,
        userId: userId,
        itemId: itemId,
      },
    });
    return tag;
  } catch (e) {
    console.log(e);
  }
};

//create tag
export const createTag = async (
  tagName: string,
  userId: number,
  itemId: number,
) => {
  try {
    const tag = await prismaClient.tag.create({
      data: {
        name: tagName,
        userId: userId,
        itemId: itemId,
      },
    });
    return tag;
  } catch (error) {
    console.error("Error occurred while creating movie:", error);
  }
};

//update tag
export const updateTag = async (request: any) => {
  try {
    const tagId = request.params.id;
    const tagData = request.body;

    delete tagData.id;
    delete tagData.userId;
    const tag = await prismaClient.tag.update({
      where: {
        id: tagId,
      },
      data: tagData,
    });
    return tag;
  } catch (e) {
    console.log(e);
  }
};

//delete tag
export const deleteTag = async (tagId: number) => {
  try {
    await prismaClient.tag.delete({
      where: {
        id: tagId,
      },
    });
    return {success: true};
  } catch (e) {
    console.log(e);
    return {success: false};
  }
};

export const getTagsFromItem = async (itemId: number, userId: number) => {
  try {
    const tags = await prismaClient.tag.findMany({
      where: {
        itemId: itemId,
        userId: userId,
      },
    });
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
  }
};

export const getNumOfFavTag = async (userId: number) => {
  try {
    const count = await prismaClient.tag.count({
      where: {
        userId: userId,
        name: "favourite",
      },
    });
    return count;
  } catch (error) {
    console.error("Error finding tags:", error);
    return 0;
  }
};
