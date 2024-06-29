import {getPoepleById} from "./people";
import {prismaClient} from "./prisma";

export const createPeopleinItemsAssignments = async (request: any) => {
  try {
    const assignmentData = request.body;
    const assignment = await prismaClient.peopleInItems.create({
      data: assignmentData,
    });
    return assignment;
  } catch (error) {
    console.error("Error occurred while creating people in items:", error);
  }
};

//Return all people from items
export const getPeopleFromItem = async (itemId: number) => {
  try {
    const peopleAssignment = await prismaClient.peopleInItems.findMany({
      where: {
        itemId: itemId,
      },
    });
    const peopleIds = peopleAssignment.map((assigment) => assigment.peopleId);
    const allPeopleFromItem = await Promise.all(
      peopleIds.map((peopleId) => getPoepleById(peopleId)),
    );

    return allPeopleFromItem;
  } catch (e) {
    console.error("Error fetching history items for profile:", e);
  }
};
