import {countItemsInLibrary} from "../database/itemsInLibraries";
import {getHistoryItemsInProfile} from "../database/itemsInProfiles";
import {getAllPreferencesInProfile} from "../database/preferenceInProfile";
import {getUserById} from "../database/user";
import {SimpleItem, User} from "../interfaces";
import {getSimpleItemInfoByItemId} from "./getItemInfo";
import {getNumOfFavItem} from "./handleItemTag";

export async function getUserInfoByUserId(userId: number): Promise<User> {
  const user = await getUserById(userId);
  if (!user) {
    console.log("User for userId: ", userId, " is invalid!");
    throw new Error(`User with ID ${userId} not found`);
  }

  const itemsInProfiles = await getHistoryItemsInProfile(user.profileId);
  const historyItem: SimpleItem[] = [];
  for (const item of itemsInProfiles) {
    if (item) {
      const simpleItem = await getSimpleItemInfoByItemId(item.id, userId);
      if (simpleItem) historyItem.push(simpleItem);
    }
  }

  const preferencesInProfile = await getAllPreferencesInProfile(user.profileId);
  const preferences: string[] = [];
  for (const preference of preferencesInProfile) {
    if (preference) preferences.push(preference?.name);
  }

  // Convert user.profile.registeredDate to Singapore time and format it
  const registeredDate = new Date(user.profile.registeredDate);
  const singaporeTimeOptions = {
    timeZone: "Asia/Singapore",
    month: "long" as const, // Ensure the month is specified as "long"
    day: "numeric" as const, // Ensure the day is specified as "numeric"
    year: "numeric" as const, // Ensure the year is specified as "numeric"
  };
  const formatter = new Intl.DateTimeFormat("en-US", singaporeTimeOptions);
  const formattedDateJoined = formatter.format(registeredDate);

  const count = await countItemsInLibrary(user.libraryId);
  const Name = user.userName ? user.userName : "";

  const numberOfFavouriteItem = await getNumOfFavItem(userId);

  return {
    id: user.id,
    email: user.email,
    name: Name,
    //dateJoined: user.profile.registeredDate,
    numberOfFavItem: numberOfFavouriteItem,
    dateJoined: formattedDateJoined,
    numberOfLikedItem: user.profile.likedItem,
    numberOfRating: user.rate.length,
    timeUsedAppInMins: user.profile.timeUsedInApp,
    history: historyItem,
    countItemsInLibrary: count,
    preference: preferences,
  };
}
