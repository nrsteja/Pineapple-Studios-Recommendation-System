import {getPicsumURL} from "../constants";
import {getItemById} from "../database/item";
import {prismaClient} from "../database/prisma";
import {getUserById} from "../database/user";
import {Folder, ItemInfo, SimpleItem} from "../interfaces";
import {getItemInfoByItemId} from "./getItemInfo";

const prisma = prismaClient;

export async function getFolderInfo(
  folderId: number,
  userId: number,
): Promise<Folder | null> {
  try {
    // Check if the folder exists in the library
    const user = await getUserById(userId);
    if (!user) {
      console.error("User is not exist");
      return null;
    }

    const folder: {
      id: number;
      name: string;
      isSeries: boolean;
      libraryId: number | null;
    } | null = await prisma.folder.findFirst({
      where: {
        id: folderId,
        libraryId: user.libraryId,
      },
    });

    if (!folder) {
      console.log(
        `Folder with ID ${folderId} does not exist in the library with ID ${user.libraryId}`,
      );
      return null;
    }

    const items: {folderId: number; itemId: number; addedAt: Date}[] | null =
      await prisma.itemsInFolders.findMany({
        where: {
          folderId: folderId,
        },
      });

    const simpleItems: SimpleItem[] = [];

    for (const i of items) {
      const itemList: ItemInfo | undefined = await getItemInfoByItemId(
        i.itemId,
        userId,
      );

      if (itemList) {
        simpleItems.push(itemList);
      }
    }

    return {
      id: folder.id,
      name: folder.name,
      isSeries: folder.isSeries,
      img:
        (items.length === 0
          ? undefined
          : (await getItemById(items[0].itemId))?.image) ??
        getPicsumURL(folderId),
      items: simpleItems,
    }; // Return true to indicate success
  } catch (error) {
    console.error("Error removing item to folder:", error);
    return null;
  }
}
