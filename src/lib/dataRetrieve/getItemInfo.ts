import {getBookByItemId, getBookDetailsRequestById} from "../database/book";
import {createBookItem} from "../database/bookAPI";
import {getItemById} from "../database/item";
import {isItemInLibrary} from "../database/itemsInLibraries";
import {getMovieByItemId, getMovieDetailsRequestById} from "../database/movie";
import {createMovieItem} from "../database/movieAPI";
import {getPeopleFromItem} from "../database/peopleInItems";
import {prismaClient} from "../database/prisma";
import {getSongById, getSongDetailsRequestById} from "../database/song";
import {createSongItem} from "../database/songAPI";
import {getTagsFromItem} from "../database/tag";
import {getUserById} from "../database/user";
import {
  BookContent,
  ItemInfo,
  ItemType,
  MovieContent,
  People,
  SimpleItem,
  SongContent,
} from "../interfaces";

export async function getItemInfoByItemId(
  itemId: number,
  userId: number,
): Promise<ItemInfo | undefined> {
  const user = await getUserById(userId);
  if (!user) {
    console.log("cannot find user");
    return undefined;
  }
  //return type is ItemInfo or undefined
  const item = await getItemById(itemId);
  if (!item) {
    console.log("Item not existing");
    return undefined;
  }
  const isItemInLibraryCheck: boolean = await isItemInLibrary(
    user.libraryId,
    itemId,
  );

  let content: SongContent | MovieContent | BookContent | undefined; // Initialize content variable as undefined
  let itemType: ItemType;
  // Based on the item type, retrieve additional content information
  switch (item.itemType) {
    case "book":
      // eslint-disable-next-line no-case-declarations
      const book = await getBookByItemId(itemId);
      content = {
        pageCount: book?.pages ?? undefined,
        description: book?.description ?? undefined,
      };
      itemType = ItemType.Book;
      break;
    case "movie":
      // eslint-disable-next-line no-case-declarations
      const movie = await getMovieByItemId(itemId);
      content = {
        duration: movie?.duration ?? undefined,
        country: item?.country ?? undefined,
        description: movie?.description ?? undefined,
      };
      itemType = ItemType.Movie;
      break;
    case "song":
      // eslint-disable-next-line no-case-declarations
      const song = await getSongById(itemId);
      content = {
        duration: song?.duration ?? undefined,
        album: song?.album ?? undefined,
      };
      itemType = ItemType.Song;
      break;
    default:
      console.log("Invalid item type:", item.itemType);
      return undefined; // Return undefined for invalid item types
  }

  const tagsFromItem = await getTagsFromItem(itemId, userId);
  const tags: string[] = []; // Initialize tags as an empty array

  if (tagsFromItem != undefined) {
    for (const tag of tagsFromItem) {
      if (tag) tags.push(tag?.name);
    }
  }

  const people: People[] = [];
  const peopleFromItem = await getPeopleFromItem(itemId);
  if (peopleFromItem != undefined) {
    for (const person of peopleFromItem) {
      if (person) {
        const data: People = {
          name: person.name,
          role: person.role,
        };
        people.push(data);
      }
    }
  }

  return {
    id: itemId,
    title: item.title,
    isInLibrary: isItemInLibraryCheck,
    img: item.image,
    genre: item.genre.split(", "),
    tag: tags,
    country: item.country ?? undefined,
    publicationDate: item.publishedDate,
    type: itemType,
    otherContent: content,
    people: people,
  };
}

export async function getItemIdBySrcId(
  srcId: string,
): Promise<number | undefined> {
  try {
    const movie = await prismaClient.movie.findUnique({
      where: {
        srcId,
      },
      select: {
        itemId: true,
      },
    });

    if (movie) return movie.itemId;

    const book = await prismaClient.book.findUnique({
      where: {
        srcId,
      },
      select: {
        itemId: true,
      },
    });

    if (book) return book.itemId;

    const song = await prismaClient.song.findUnique({
      where: {
        srcId,
      },
      select: {
        itemId: true,
      },
    });

    if (song) return song.itemId;
  } catch (error) {
    console.error("Error fetching item id:", error);
    return undefined;
  }
}

//create Item here
export async function getItemInfoBySrcId(
  srcId: string,
  userId: number,
): Promise<ItemInfo | undefined> {
  // Search item in DB
  console.log(srcId);
  const parts = srcId.split("+");
  const itemType = parts[0];
  const id = parts[1];
  console.log(id);
  let itemId = await getItemIdBySrcId(id);

  // Item is not found in DB
  if (itemId === undefined || itemId === null) {
    let resultItem;
    switch (itemType) {
      case "book":
        console.log("Creating Book Item");
        const bookData = await getBookDetailsRequestById(srcId);
        resultItem = await createBookItem(bookData);
        break;
      case "movie":
        console.log("Creating Movie Item");
        const movieData = await getMovieDetailsRequestById(srcId);
        resultItem = await createMovieItem(movieData);
        break;
      case "song":
        console.log("Creating song Item");
        const songData = await getSongDetailsRequestById(srcId);
        console.log(songData);
        resultItem = await createSongItem(songData);
        break;
    }

    if (resultItem?.item) {
      itemId = resultItem.item.id;
    } else {
      return undefined; // Return undefined if resultItem is undefined
    }
  }
  // Return the result of getItemInfoByItemId
  return getItemInfoByItemId(itemId, userId);
}

export async function getSimpleItemInfoByItemId(
  itemId: number,
  userId: number,
): Promise<SimpleItem | undefined> {
  //return type is ItemInfo or undefined
  const item = await getItemById(itemId);
  if (!item) {
    console.log("Item not existing");
    return undefined;
  }
  //check item type,
  let itemType: ItemType;
  if (item.itemType == "book") {
    itemType = ItemType.Book;
  } else if (item.itemType == "movie") itemType = ItemType.Movie;
  else itemType = ItemType.Song;
  //get tags from item
  const tagsFromItem = await getTagsFromItem(itemId, userId);
  const tags: string[] = []; // Initialize tags as an empty array

  if (tagsFromItem != undefined) {
    for (const tag of tagsFromItem) {
      if (tag) tags.push(tag?.name);
    }
  }

  return {
    id: item.id,
    title: item.title,
    img: item.image,
    tag: tags,
    type: itemType,
  };
}
