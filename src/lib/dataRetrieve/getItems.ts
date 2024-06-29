import {countItems, getItemById, getLastItemId} from "../database/item";
import {SimpleItem} from "../interfaces";
import {getSimpleItemInfoByItemId} from "./getItemInfo";

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

async function getRandomItemsByType(
  type: string,
  numberOfItem: number,
  userId: number,
): Promise<SimpleItem[]> {
  const Items: SimpleItem[] = [];
  const allItems: SimpleItem[] = [];
  const totalItemCount: number | undefined = await getLastItemId();

  if (!totalItemCount) {
    return Items;
  }

  // Get all items of the specified type
  for (let itemId = 1; itemId <= totalItemCount; itemId++) {
    const item = await getItemById(itemId);
    if (item && item.itemType === type) {
      const simpleItemData = await getSimpleItemInfoByItemId(itemId, userId);
      if (simpleItemData) allItems.push(simpleItemData);
    }
  }

  // If the total number of items is less than the required number, return all items
  if (allItems.length < numberOfItem) {
    return allItems;
  }

  // Shuffle the array of all items
  const shuffledItems = shuffleArray(allItems);
  return shuffledItems.slice(0, numberOfItem);
}

export async function getMultipleSimpleItems(
  numberOfBooks: number,
  numberOfMovies: number,
  numberOfSongs: number,
  userId: number,
): Promise<SimpleItem[]> {
  // Initialize arrays to hold random items for each type
  const Books: SimpleItem[] = await getRandomItemsByType(
    "book",
    numberOfBooks,
    userId,
  );
  const Movies: SimpleItem[] = await getRandomItemsByType(
    "movie",
    numberOfMovies,
    userId,
  );
  const Songs: SimpleItem[] = await getRandomItemsByType(
    "song",
    numberOfSongs,
    userId,
  );

  // Return the combined array of random items
  return [...Books, ...Movies, ...Songs];
}
