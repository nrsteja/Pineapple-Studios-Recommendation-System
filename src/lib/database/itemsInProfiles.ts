import {MAX_SLOTS_PER_USER_FOR_HISTORY_ITEM} from "../constants";
import {getItemById} from "./item";
import {prismaClient} from "./prisma";
import {getProfileById} from "./profile";

export const createItemInProfileAssignments = async (
  profileId: number,
  itemId: number,
) => {
  try {
    const historyItemCount = await prismaClient.itemsInProfiles.count({
      where: {
        profileId: profileId,
      },
    });

    // If the number of entries exceeds the maximum slots, remove the oldest entry
    if (historyItemCount >= MAX_SLOTS_PER_USER_FOR_HISTORY_ITEM) {
      const oldestAssignment = await prismaClient.itemsInProfiles.findFirst({
        where: {
          profileId: profileId,
        },
        orderBy: {
          addedAt: "asc",
        },
      });
      // Remove the oldest assignment
      if (oldestAssignment) {
        await deleteItemInProfileAssignment(
          oldestAssignment.profileId,
          oldestAssignment.itemId,
        );
      }
    }

    const assignment = await prismaClient.itemsInProfiles.create({
      data: {
        profileId: profileId,
        itemId: itemId,
      },
    });
    return assignment;
  } catch (error) {
    console.error(
      "Error occurred while creating assignment for item in profiles:",
      error,
    );
  }
};

export const deleteItemInProfileAssignment = async (
  profileId: number,
  itemId: number,
) => {
  try {
    await prismaClient.itemsInProfiles.deleteMany({
      where: {
        profileId: profileId,
        itemId: itemId,
      },
    });
  } catch (error) {
    console.error(
      "Error occurred while creating assignment for item in profiles:",
      error,
    );
  }
};

export const getItemInProfileAssignment = async (
  profileId: number,
  itemId: number,
) => {
  try {
    const assigment = await prismaClient.itemsInProfiles.findFirst({
      where: {
        profileId: profileId,
        itemId: itemId,
      },
    });
    return assigment;
  } catch (error) {
    console.error(
      "Error occurred while finding assignment for item in profiles:",
      error,
    );
  }
};
//Return all history items in a profile
export const getHistoryItemsInProfile = async (profileId: number) => {
  try {
    const itemAssignments = await prismaClient.itemsInProfiles.findMany({
      where: {
        profileId: profileId,
      },
      orderBy: {
        addedAt: "desc", // Order by addedAt attribute in descending order
      },
    });

    const itemIds = itemAssignments.map((assigment) => assigment.itemId);
    const allItemsFromProfile = await Promise.all(
      itemIds.map((itemId) => getItemById(itemId)),
    );
    return allItemsFromProfile;
  } catch (e) {
    console.error("Error fetching history items for profile:", e);
    throw e;
  }
};

//Return all profile using a specific history item
export const getProfileFromHistoryItem = async (itemId: number) => {
  try {
    const profileAssignments = await prismaClient.itemsInProfiles.findMany({
      where: {
        itemId: itemId,
      },
    });

    const profileIds = profileAssignments.map(
      (assigment) => assigment.profileId,
    );
    const allProfilesFromItem = await Promise.all(
      profileIds.map((profileId) => getProfileById(profileId)),
    );

    return allProfilesFromItem;
  } catch (e) {
    console.error("Error fetching profile for history items:", e);
    throw e;
  }
};

//update "addedAt"
export const updateItemInProfileAssignmentToCurrentDate = async (
  profileId: number,
  itemId: number,
) => {
  try {
    const assignment = await prismaClient.itemsInProfiles.update({
      where: {
        profileId_itemId: {
          profileId: profileId,
          itemId: itemId,
        },
      },
      data: {
        addedAt: new Date(), // current date and time
      },
    });
    return assignment;
  } catch (error) {
    console.error("Error updating history items:", error);
  }
};
