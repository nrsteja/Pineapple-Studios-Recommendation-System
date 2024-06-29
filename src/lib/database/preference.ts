import {prismaClient} from "./prisma";

//CRUD

//get all preferences
export const getAllPreferences = async () => {
  try {
    const allPreferences = await prismaClient.preference.findMany();
    return allPreferences;
  } catch (e) {
    console.log(e);
  }
};

//get preference by Id
export const getPreferenceById = async (preferenceId: number) => {
  try {
    const preference = await prismaClient.preference.findUnique({
      where: {
        id: preferenceId,
      },
    });
    return preference;
  } catch (e) {
    console.log(e);
  }
};

//get preference by preference name
export const getPreferenceByName = async (preferenceName: string) => {
  try {
    const preference = await prismaClient.preference.findFirst({
      where: {
        name: preferenceName,
      },
    });
    return preference;
  } catch (e) {
    console.log(e);
  }
};

//create preference
export const createPreference = async (preferenceName: string) => {
  try {
    const preference = await prismaClient.preference.create({
      data: {
        name: preferenceName,
      },
    });
    return preference;
  } catch (error) {
    console.error("Error occurred while creating movie:", error);
  }
};

//update preference
export const updatePreferenceName = async (
  preferenceId: number,
  newPreferenceName: string,
) => {
  try {
    const preference = await prismaClient.preference.update({
      where: {
        id: preferenceId,
      },
      data: {
        name: newPreferenceName,
      },
    });
    return preference;
  } catch (e) {
    console.log(e);
  }
};

//delete preference
export const deletePreferenceById = async (preferenceId: number) => {
  try {
    await prismaClient.preference.delete({
      where: {
        id: preferenceId,
      },
    });
    return {success: true};
  } catch (e) {
    console.log(e);
    return {success: false};
  }
};
