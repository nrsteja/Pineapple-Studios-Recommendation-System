import {isItemInLibrary} from "../database/itemsInLibraries";
import {
  createRecentItemAssignments,
  deleteRecentItemAssignments,
} from "../database/recentItems";
import {
  createTag,
  deleteTag,
  getTagByNameAndUserIdAndItemId,
} from "../database/tag";
import {getNumOfFavTag} from "../database/tag";
import {getUserById} from "../database/user";
import {addItemToLibrary} from "./handleLibraryItems";

// export async function
// addItemToFavourtie(userId:
// number, itemId: number) {

// export async function addItemToFavourtie(userId: number, itemId: number) {
//   const tag = await addTagForItem(userId, "favourite", itemId);
//   if (!tag) {
//     return {error: "Error occured when adding item to favourite"};
//   }

//   await createRecentItemAssignments(itemId, userId);
// }

export async function addItemToFavourite(userId: number, itemId: number) {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return {error: "User with ID " + userId + " is invalid."};
    }

    // Check if the item is in the library, if not, add it to the library first
    const itemInLibrary = await isItemInLibrary(userId, itemId);
    if (!itemInLibrary) {
      await addItemToLibrary(userId, itemId);
    }

    // Add the item to favorites
    const tag = await addTagForItem(userId, "favourite", itemId);
    if (!tag) {
      return {error: "Error occurred when adding item to favorites"};
    }

    // Create recent item assignment
    await createRecentItemAssignments(itemId, userId);
  } catch (error) {
    console.error("Error adding item to favorite:", error);
    return {error: "Error occurred when adding item to favorites"};
  }
}

export async function removeItemFromFavourite(userId: number, itemId: number) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tag = await removeTagForItem(userId, "favourite", itemId);

  await deleteRecentItemAssignments(itemId, userId);
}

export async function addTagForItem(
  userId: number,
  newTagName: string,
  itemId: number,
) {
  const user = await getUserById(userId);
  if (!user) {
    return {error: "User for userId " + userId + " is invalid."};
  }

  let tag = await getTagByNameAndUserIdAndItemId(newTagName, userId, itemId);

  if (!tag) {
    tag = await createTag(newTagName, userId, itemId);
    console.log("New tag : ", newTagName, " created");
  } else {
    console.error("Tag : ", newTagName, " is ALREADY created");
  }
  return tag;
}

export async function removeTagForItem(
  userId: number,
  tagName: string,
  itemId: number,
) {
  const user = await getUserById(userId);
  if (!user) {
    return {error: "User for userId " + userId + " is invalid."};
  }

  const tag = await getTagByNameAndUserIdAndItemId(tagName, userId, itemId);

  if (tag) {
    await deleteTag(tag.id);
    console.log("Tag : ", tagName, " is removed for userId : ", userId);
  } else {
    console.log("Tag : ", tagName, " is ALREADY removed for userId : ", userId);
  }
  return tag;
}

export async function getNumOfFavItem(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    console.log("User for userId " + userId + " is invalid.");
    return 0;
  }

  return await getNumOfFavTag(userId);
}
