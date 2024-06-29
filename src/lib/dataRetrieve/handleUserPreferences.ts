import {createPreference, getPreferenceByName} from "../database/preference";
import {
  createPreferenceInProfileAssignments,
  deletePreferenceInProfileAssignment,
  getAllPreferencesInProfile,
  getAllProfilesUseSpecificPreference,
  getPreferenceInProfileAssignment,
} from "../database/preferenceInProfile";
import {getUserById} from "../database/user";

export async function addPreferenceForUser(
  userId: number,
  preferenceName: string,
) {
  //sanity check
  const user = await getUserById(userId);
  if (!user) {
    console.log("User for userId: ", userId, " is not created.");
    return;
  }
  let preference = await getPreferenceByName(preferenceName);
  if (!preference) {
    preference = await createPreference(preferenceName);
    console.log("New preference : ", preference, " created in database");
  }
  //Sanity Check
  if (!preference) return;

  let preferenceCheck = await getPreferenceInProfileAssignment(
    user.profileId,
    preference.id,
  );
  if (!preferenceCheck) {
    preferenceCheck = await createPreferenceInProfileAssignments(
      user.profileId,
      preference.id,
    );
  }
  console.log("The preference assignment for user is created.");
  return preferenceCheck;
}

export async function removePreferenceForUser(
  userId: number,
  preferenceName: string,
) {
  //sanity check
  const user = await getUserById(userId);
  if (!user) {
    console.log("User for userId: ", userId, " is not created.");
    return;
  }
  const preference = await getPreferenceByName(preferenceName);
  if (!preference) {
    console.log(
      "There is no preference : ",
      preferenceName,
      " existed ofr user",
    );
    return;
  }
  const preferenceCheck = await getPreferenceInProfileAssignment(
    user.profileId,
    preference.id,
  );
  if (preferenceCheck) {
    await deletePreferenceInProfileAssignment(user.profileId, preference.id);
    console.log("The preference : ", preferenceName, "is removed");
  } else {
    console.log("The preference : ", preferenceName, "is already removed");
  }
}

export async function checkIsUserPreference(
  userId: number,
  preferenceName: string,
) {
  const user = await getUserById(userId);
  if (!user) {
    console.log("User for userId: ", userId, " is not created.");
    return;
  }

  const preference = await getPreferenceByName(preferenceName);
  if (!preference) {
    console.log(
      "There is no preference : ",
      preferenceName,
      " existed for user",
    );
    return;
  }

  const assignment = await getPreferenceInProfileAssignment(
    user.profileId,
    preference.id,
  );
  if (assignment) {
    return true;
  } else {
    return false;
  }
}

export async function getPreferencesOfUser(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    console.log("User for userId: ", userId, " is not created.");
    return [];
  }

  const preferenceAssignments = await getAllPreferencesInProfile(
    user.profileId,
  );

  let listOfPrefence: string[] = [];
  for (const preference of preferenceAssignments) {
    if (preference) listOfPrefence.push(preference.name);
  }

  return listOfPrefence;
}
