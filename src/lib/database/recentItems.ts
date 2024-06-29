import {MAX_SLOTS_PER_USER_FOR_RECENT_ITEM} from "../constants";
import {prismaClient} from "./prisma";

export const createRecentItemAssignments = async (
  itemId: number,
  userId: number,
) => {
  try {
    // Check the number of existing entries for the user
    const userItemCount = await prismaClient.recentItems.count({
      where: {
        userId: userId,
      },
    });

    // If the number of entries exceeds the maximum slots, remove the oldest entry
    if (userItemCount >= MAX_SLOTS_PER_USER_FOR_RECENT_ITEM) {
      const oldestAssignment = await prismaClient.recentItems.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          addedAt: "asc",
        },
      });

      // Remove the oldest assignment
      if (oldestAssignment) {
        await deleteRecentItemAssignments(
          oldestAssignment.userId,
          oldestAssignment.itemId,
        );
      }
    }

    // Create new assignment
    const assignment = await prismaClient.recentItems.create({
      data: {
        itemId: itemId,
        userId: userId,
      },
    });
    return assignment;
  } catch (error) {
    console.error(
      "Error occurred while creating recentItem in user assignment:",
      error,
    );
  }
};

export const deleteRecentItemAssignments = async (
  itemId: number,
  userId: number,
) => {
  try {
    await prismaClient.recentItems.deleteMany({
      where: {
        itemId: itemId,
        userId: userId,
      },
    });
  } catch (error) {
    console.error(
      "Error occured while deleting recent Item in user assignment: ",
      error,
    );
  }
};

export const getRecentItemAddedByUser = async (userId: number) => {
  try {
    const recentItems = await prismaClient.recentItems.findMany({
      where: {
        userId: userId,
      },
    });

    return recentItems;
  } catch (error) {
    console.error(
      "Error occurred while retrieving recent items added by user:",
      error,
    );
  }
};
