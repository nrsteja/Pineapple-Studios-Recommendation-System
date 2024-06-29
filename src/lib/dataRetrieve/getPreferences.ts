import {getAllPreferences} from "../database/preference";

export async function getAllPreferencesInTheSystem() {
  const preferencesInSystem = await getAllPreferences();
  let preferenceArray: string[] = [];
  if (!preferencesInSystem) {
    console.log("There is no preference in system");
    return preferenceArray;
  }

  for (const preference of preferencesInSystem) {
    preferenceArray.push(preference.name);
  }

  return preferenceArray;
}
