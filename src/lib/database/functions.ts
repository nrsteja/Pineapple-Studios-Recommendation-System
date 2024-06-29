import {ItemInfo, ItemType, People, SongContent} from "../interfaces";

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// import { PrismaClient, Library } from '@prisma/client';

// const prisma = new PrismaClient();

// interface LibraryInfo {
//   library: Library;
//   userId: number;
// }

// export async function getLibraryInfoByUserId(userId: number): Promise<LibraryInfo | null> {
//   try {
//     const userLibrary = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//       select: {
//         library: true,
//       },
//     });

//     if (!userLibrary) {
//       console.log(`User with ID ${userId} does not have a library.`);
//       return null;
//     }

//     const library = await prisma.library.findUnique({
//       where: {
//         id: userLibrary.library.id,
//       },
//       include: {
//         items: true,
//         folders: {
//           include: {
//             series: true,
//           },
//         },
//       },
//     });

//     // Check if the library exists
//     if (!library) {
//       console.log(`Library not found for user with ID ${userId}.`);
//       return null;
//     }

//     // Return the library along with the userId
//     return { library, userId };
//   } catch (error) {
//     console.error('Error fetching library info:', error);
//     return null;
//   }
// }

export function getItemInfoExample(id: string): ItemInfo | undefined {
  const content: SongContent = {
    duration: 150,
    album: "album1",
  };

  function makePeople(): People[] {
    const returnList: People[] = [];
    for (let i = 0; i < 3; i++) {
      const id = randomInteger(0, 1084);
      const newItem: People = {
        name: `people${id}`,
        role: `role${id}`,
      };
      returnList.push(newItem);
    }

    return returnList;
  }

  if (isNaN(+id)) {
    const newId = randomInteger(0, 1084);
    return {
      id: newId,
      title: `title ${id}`,
      isInLibrary: !isNaN(+id),
      img: `https://picsum.photos/id/${randomInteger(0, 1084)}/200.webp`, // string of the url
      genre: ["genre1", "genre2"],
      tag: ["genre1", "genre2"],
      country: "Singapore",
      publicationDate: "2021-12-02",
      type: ItemType.Song, // movie song or book
      otherContent: content,
      people: makePeople(),
    };
  }

  return {
    id: +id,
    title: `title ${id}`,
    isInLibrary: !isNaN(+id),
    img: `https://picsum.photos/id/${randomInteger(0, 1084)}/200.webp`,
    genre: ["genre1", "genre2"],
    tag: ["genre1", "genre2"],
    country: "Singapore",
    publicationDate: "2021-12-02",
    type: ItemType.Song, // movie song or book
    otherContent: content,
    people: makePeople(),
  };
}
