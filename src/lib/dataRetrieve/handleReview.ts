import {prismaClient} from "../database/prisma";
import {createReview, updateReview} from "../database/review";

const prisma = prismaClient;

export const handleReview = async (
  userId: number,
  itemId: number,
  content: string,
) => {
  try {
    // Check if the user has already reviewed the item
    const existingReview = await getReviewByUserAndItem(userId, itemId);

    if (existingReview) {
      // If the user has already reviewed, update their review
      await updateReview(existingReview.id, content);
      return {success: true, message: "Review updated successfully"};
    } else {
      // If the user hasn't reviewed, create a new review
      await createReview(userId, itemId, content);
      return {success: true, message: "Review added successfully"};
    }
  } catch (error) {
    console.error("Error occurred while handling review:", error);
    return {success: false, message: "An error occurred while handling review"};
  }
};

const getReviewByUserAndItem = async (userId: number, itemId: number) => {
  try {
    const review = await prisma.review.findFirst({
      where: {
        userId: userId,
        itemId: itemId,
      },
    });
    return review;
  } catch (error) {
    console.error(
      "Error occurred while fetching review by user and item:",
      error,
    );
    return null;
  }
};
