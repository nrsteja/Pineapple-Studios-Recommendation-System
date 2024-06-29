import {prismaClient} from "../database/prisma";

const prisma = prismaClient;

// Create a review
export const createReview = async (
  userId: number,
  itemId: number,
  content: string,
) => {
  try {
    const review = await prisma.review.create({
      data: {
        userId: userId,
        itemId: itemId,
        content: content,
      },
    });
    return review;
  } catch (error) {
    console.error("Error occurred while creating review:", error);
    return null;
  }
};

// Get reviews for an item
export const getReviewsByItemId = async (itemId: number) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        itemId: itemId,
      },
    });
    return reviews;
  } catch (error) {
    console.error("Error occurred while fetching reviews for item:", error);
    return [];
  }
};

// Update a review
export const updateReview = async (reviewId: number, content: string) => {
  try {
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        content: content,
      },
    });
    return updatedReview;
  } catch (error) {
    console.error("Error occurred while updating review:", error);
    return null;
  }
};

// Delete a review
export const deleteReview = async (reviewId: number) => {
  try {
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error occurred while deleting review:", error);
    return false;
  }
};
