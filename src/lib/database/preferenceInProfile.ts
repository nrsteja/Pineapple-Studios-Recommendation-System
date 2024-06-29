import {getPreferenceById} from "./preference";
import {prismaClient} from "./prisma";
import {getProfileById} from "./profile";

export const createPreferenceInProfileAssignments = async (
  profileId: number,
  preferenceId: number,
) => {
  try {
    const assignment = await prismaClient.preferenceInProfile.create({
      data: {
        profileId: profileId,
        preferenceId: preferenceId,
      },
    });
    return assignment;
  } catch (error) {
    console.error(
      "Error occurred while creating Preference in Profile assignment:",
      error,
    );
  }
};

export const deletePreferenceInProfileAssignment = async (
  profileId: number,
  preferenceId: number,
) => {
  try {
    await prismaClient.preferenceInProfile.deleteMany({
      where: {
        profileId: profileId,
        preferenceId: preferenceId,
      },
    });
  } catch (error) {
    console.error(
      "Error occured while deleting Preference in Profile assignment: ",
      error,
    );
  }
};

export const getPreferenceInProfileAssignment = async (
  profileId: number,
  preferenceId: number,
) => {
  try {
    const assignment = await prismaClient.preferenceInProfile.findFirst({
      where: {
        profileId: profileId,
        preferenceId: preferenceId,
      },
    });
    return assignment;
  } catch (error) {
    console.error("Error occured while getting Preference in profile", error);
  }
};

// Return all the preferences that are in a profile
export const getAllPreferencesInProfile = async (profileId: number) => {
  try {
    // Retrieve all preferences assignments for the given profile
    const preferenceAssignments =
      await prismaClient.preferenceInProfile.findMany({
        where: {
          profileId: profileId,
        },
      });
    // Extract preferences IDs from preferences assignments
    const preferenceId = preferenceAssignments.map(
      (assignment) => assignment.preferenceId,
    );
    // Retrieve all preferencess by their IDs
    const allPreferencesInProfile = await Promise.all(
      preferenceId.map((preferenceId) => getPreferenceById(preferenceId)),
    );

    return allPreferencesInProfile;
  } catch (error) {
    console.error("Error fetching preferences for profile:", error);
    throw error;
  }
};

//Return all the profiles that are using a preference
export const getAllProfilesUseSpecificPreference = async (
  preferenceId: number,
) => {
  try {
    const profileAssignments = await prismaClient.preferenceInProfile.findMany({
      where: {
        preferenceId: preferenceId,
      },
    });

    const profileId = profileAssignments.map(
      (assignment) => assignment.profileId,
    );
    const allProfilesUseSpecificPreference = await Promise.all(
      profileId.map((profileId) => getProfileById(profileId)),
    );

    return allProfilesUseSpecificPreference;
  } catch (error) {
    console.error("Error fetching profile for a specific preferences:", error);
    throw error;
  }
};
