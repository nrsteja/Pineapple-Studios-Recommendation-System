import {prismaClient} from "./prisma";

// createPeople
export const createPeople = async (request: any) => {
  try {
    const peopleData = request.body;
    // Create the associated item
    const people = prismaClient.people.create({
      data: peopleData,
    });
    return people;
  } catch (e) {
    console.error("Error occurred while creating people:", e);
  }
};

export const getPeopleByNameAndRole = async (
  personName: any,
  personRole: any,
) => {
  try {
    const people = await prismaClient.people.findFirst({
      where: {
        name: personName,
        role: personRole,
      },
    });
    return people;
  } catch (e) {
    console.log("Error occured while creating people", e);
  }
};

//get people by Id
export const getPoepleById = async (peopleId: number) => {
  try {
    const people = await prismaClient.people.findUnique({
      where: {
        id: peopleId,
      },
    });
    return people;
  } catch (e) {
    console.log(e);
  }
};
