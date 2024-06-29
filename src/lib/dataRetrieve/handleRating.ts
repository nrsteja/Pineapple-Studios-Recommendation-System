import {prismaClient} from "../database/prisma";
import {createRating, updateRating} from "../database/rate";

const prisma = prismaClient;

export const handleRating = async (
  userId: number,
  itemId: number,
  rating: number,
) => {
  try {
    // Check if the user has already rated the item
    const existingRating = await getRatingByUserAndItem(userId, itemId);

    if (existingRating) {
      // If the user has already rated, update their rating
      await updateRating(existingRating.id, rating);
      return {success: true, message: "Rating updated successfully"};
    } else {
      // If the user hasn't rated, create a new rating
      await createRating(userId, itemId, rating);
      return {success: true, message: "Rating added successfully"};
    }
  } catch (error) {
    console.error("Error occurred while handling rating:", error);
    return {success: false, message: "An error occurred while handling rating"};
  }
};
// Helper function to get rating by user and item
const getRatingByUserAndItem = async (userId: number, itemId: number) => {
  try {
    const rating = await prisma.rate.findFirst({
      where: {
        userId: userId,
        itemId: itemId,
      },
    });
    return rating;
  } catch (error) {
    console.error("Error occurred while fetching rating:", error);
    return null;
  }
};
