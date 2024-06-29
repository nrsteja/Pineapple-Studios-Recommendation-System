import {
  createPreference,
  deletePreferenceById,
  getPreferenceByName,
} from "../database/preference";

export async function createNewPreference(preferenceName: string) {
  const preferenceCheck = await getPreferenceByName(preferenceName);
  if (preferenceCheck) {
    console.log("Preference ", preferenceName, "is already exist");
    return false;
  }

  await createPreference(preferenceName.toUpperCase());
  return true;
}

export async function deletePreference(preferenceName: string) {
  const preferenceCheck = await getPreferenceByName(preferenceName);
  if (!preferenceCheck) {
    console.log("Preference ", preferenceName, "is already deleted");
    return false;
  }

  await deletePreferenceById(preferenceCheck.id);
  return true;
}
