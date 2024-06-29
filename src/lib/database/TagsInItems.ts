// import {prismaClient} from "./prisma";
// import {getTagById} from "./tag";

// export const createTagsInItemsAssignment = async (request: any) => {
//   try {
//     const assignmentData = request.body;
//     const assignment = await prismaClient.tagInItems.create({
//       data: assignmentData,
//     });
//     return assignment;
//   } catch (error) {
//     console.error("Error occurred while creating Tags in Items:", error);
//   }
// };

// export const getTaginItemAssignment = async (request: any) => {
//   try {
//     const assignmentData = request.body;
//     const assignment = await prismaClient.tagInItems.findFirst({
//       where: assignmentData,
//     });
//     return assignment;
//   } catch (error) {
//     console.error("Error occurred while creating Tags in Items:", error);
//   }
// };
// //Return all tags from items
// export const getTagsFromItem = async (itemId: number) => {
//   try {
//     const tagsAssignments = await prismaClient.tagInItems.findMany({
//       where: {
//         itemId: itemId,
//       },
//     });

//     const tagIds = tagsAssignments.map((assigment) => assigment.tagId);
//     const allTagsFromItem = await Promise.all(
//       tagIds.map((tagId) => getTagById(tagId)),
//     );

//     return allTagsFromItem;
//   } catch (e) {
//     console.error("Error fetching history items for profile:", e);
//   }
// };

// export const removeTagInItemAssignment = async (
//   itemId: number,
//   tagId: number,
// ) => {
//   try {
//     await prismaClient.tagInItems.deleteMany({
//       where: {
//         itemId: itemId,
//         tagId: tagId,
//       },
//     });
//     return true; // Indicate successful deletion
//   } catch (error) {
//     console.error("Error removing tag assignment for item:", error);
//     return false; // Return false to indicate failure
//   }
// };
