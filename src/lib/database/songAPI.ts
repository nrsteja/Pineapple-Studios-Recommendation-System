import {createItem} from "./item";
import {createPeople, getPeopleByNameAndRole} from "./people";
import {createPeopleinItemsAssignments} from "./peopleInItems";
import {createSong, getSongBySrcId} from "./song";

export const createSongItem = async (singleSongData: any) => {
  // Sanity check
  if (singleSongData == null) {
    console.log("Empty Single Song Data.");
    return null;
  }

  const songCheck = await getSongBySrcId(singleSongData.srcId);
  if (songCheck) {
    console.log("Song Already Exists in the database.");
    return songCheck;
  }

  // Create people object (artists)
  let artistArray: any[] = [];
  if (singleSongData.artists && singleSongData.artists !== "N/A") {
    // Split the artists string into an array of artist names
    const artistNames = singleSongData.artists.split(", ");
    for (const artistName of artistNames) {
      // Check if artist already exists
      const existingArtist = await getPeopleByNameAndRole(artistName, "artist");
      if (!existingArtist) {
        // Create artist if not exists
        const artistData = {
          body: {
            name: artistName,
            role: "artist",
          },
        };
        const createdArtist = await createPeople(artistData);
        artistArray.push(createdArtist);
      } else {
        artistArray.push(existingArtist);
      }
    }
  }

  // Extract date part from releaseDate
  const releaseDate = singleSongData.releaseDate
    ? singleSongData.releaseDate.split("T")[0]
    : null;
  // Create item object
  const itemData = {
    body: {
      image: singleSongData.thumbnailUrl,
      itemType: "song",
      title: singleSongData.itemTitle,
      genre: singleSongData.genre,
      language: singleSongData.language,
      publishedDate: releaseDate,
      avgRate: -1,
    },
  };

  const item = await createItem(itemData);
  if (!item) {
    console.log("Failed to create item");
    return null;
  }

  // Check if there are any artists found or created
  if (artistArray.length != 0) {
    // Only create People & item assignment when there are any artists
    // found or created
    for (const artist of artistArray) {
      const assignmentData = {
        body: {
          peopleId: artist.id,
          itemId: item.id,
        },
      };
      await createPeopleinItemsAssignments(assignmentData);
    }
    console.log(
      "Artist(s) found/created and assigned artist(s) and item created.",
    );
  } else {
    console.log("No artists found/created.");
  }

  // Create Song object
  const songData = {
    body: {
      srcId: singleSongData.srcId,
      album: singleSongData.album,
      duration: singleSongData.duration,
      itemId: item.id,
      description: singleSongData.description,
    },
  };

  const song = await createSong(songData);
  //const value = songData.body.album;
  //if (song == '1') return '1';
  //else
  return {
    songData,
    item,
    song,
  };
};
