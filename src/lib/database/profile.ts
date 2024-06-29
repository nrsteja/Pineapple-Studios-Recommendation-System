import {prismaClient} from "./prisma";

// get profile by id
export const getProfileById = async (profileId: number) => {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        id: profileId,
      },
      include: {
        user: true, //also fetch "User"
      },
    });
    return profile;
  } catch (e) {
    console.log(e);
  }
};

// create profile
export const createProfile = async () => {
  try {
    // const profileData = request.body;
    const profile = await prismaClient.profile.create({
      // data: profileData,
      data: {
        registeredDate: new Date(), // Set the current date and time, workaround
      },
    });
    return profile;
  } catch (e) {
    console.error("Error occurred while creating profile:", e);
  }
};

// update  profile
export const updateProfile = async (profileId: number, request: any) => {
  try {
    const profileData = request.body;
    // Remove bookId from bookData to prevent updating it
    delete profileData.id;

    const profile = await prismaClient.profile.update({
      where: {
        id: profileId,
      },
      data: profileData,
    });
    return profile;
  } catch (e) {
    console.log(e);
  }
};

// delete profile
export const deleteProfile = async (request: any) => {
  try {
    const profileId = request.params.id;
    const profile = await prismaClient.profile.delete({
      where: {
        id: profileId,
      },
    });
    return {success: true};
  } catch (e) {
    console.log(e);
  }
};

export const incrementLikedItems = async (profileId: number) => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new Error(`Profile with ID ${profileId} not found.`);
  }
  try {
    await prismaClient.profile.update({
      where: {
        id: profileId,
      },
      data: {
        likedItem: profile?.likedItem + 1,
      },
    });
    console.log(`LikedItem incremented for profile with ID ${profileId}.`);
  } catch (error) {
    console.log("Error occured while incrementing LikedItem by 1", error);
  }
};

export const decrementLikedItems = async (profileId: number) => {
  const profile = await getProfileById(profileId);
  if (!profile) {
    throw new Error(`Profile with ID ${profileId} not found.`);
  }
  try {
    await prismaClient.profile.update({
      where: {
        id: profileId,
      },
      data: {
        likedItem: profile?.likedItem - 1, // Decrement likedItem by 1
      },
    });
    console.log(`LikedItem decremented for profile with ID ${profileId}.`);
  } catch (error) {
    console.log("Error occurred while decrementing LikedItem by 1", error);
  }
};

// Function to update accumulated app usage time for a user //Pass in argument (profileId and latestAppUsageTime) to update timeUsedInApp
export async function updateUserAppUsage(
  profileId: number,
  latestAppUsageTime: number,
) {
  try {
    // Retrieve the profileId from the request parameter
    const userProfile = await getProfileById(profileId);

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Calculate the new total usage time by adding latestAppUsageTime to existing total
    const newTotalUsageTime = userProfile.timeUsedInApp + latestAppUsageTime;

    // Update the timeUsedInApp field in the user's profile with the new total usage time
    const data = {
      body: {
        timeUsedInApp: newTotalUsageTime,
      },
    };
    await updateProfile(profileId, data);

    return {success: true};
  } catch (error) {
    console.log(error);
  }
}
