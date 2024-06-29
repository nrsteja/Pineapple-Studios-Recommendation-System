import {deleteItem} from "./item";
import {prismaClient} from "./prisma";
import {getSpotifyTokens} from "./spotify";

// getAllSongs

// getAllSongs
export const getAllSongs = async () => {
  try {
    const allSongs = await prismaClient.song.findMany({
      include: {
        item: true, // Include the associated Item data
      },
    });
    return allSongs;
  } catch (e) {
    console.log(e);
  }
};

// getSongById
export const getSongById = async (songId: any) => {
  try {
    const song = await prismaClient.song.findUnique({
      where: {
        itemId: songId,
      },
      include: {
        item: true,
      },
    });
    return song;
  } catch (e) {
    console.log(e);
  }
};

export const getSongBySrcId = async (sourceId: any) => {
  try {
    const song = await prismaClient.song.findUnique({
      where: {
        srcId: sourceId,
      },
      include: {
        item: true,
      },
    });
    return song;
  } catch (e) {
    console.log(e);
  }
};

// createSong
export const createSong = async (reqSong: any) => {
  try {
    const songData = reqSong.body;
    const song = await prismaClient.song.create({
      data: songData,
    });
    return song;
  } catch (e) {
    console.error("Error occurred while creating song:", e);
    return "1";
  }
};

// updateSong
export const updateSong = async (request: any) => {
  try {
    const songId = request.params.itemId;
    const songData = request.body;
    // Remove songId from songData to prevent updating it
    delete songData.itemId;
    delete songData.item;
    delete songData.srcId;

    const song = await prismaClient.song.update({
      where: {
        itemId: songId,
      },
      data: songData,
    });
    return song;
  } catch (e) {
    console.log(e);
  }
};

// deleteSong
export const deleteSong = async (request: any) => {
  try {
    const songId = request.params.itemId;
    let result = await deleteItem(songId); // Await the deleteItem function directly
    if (result) {
      await prismaClient.song.delete({
        where: {
          itemId: songId,
        },
      });
      return {success: true};
    } else {
      return {success: false, error: "Unable to delete item"};
    }
  } catch (e) {
    console.log(e);
    return {success: false};
  }
};
// export const getSongRequest = async (searchValue: string, accessToken:
// string) => { try { const response = await fetch(
// `https://api.spotify.com/v1/search?q=${encodeURIComponent( searchValue,
// )}&type=track`, { headers: { Authorization: `Bearer ${accessToken}`, }, },
// );

//     if (!response.ok) {
//       throw new Error("Failed to fetch songs");
//     }

//     const responseData = await response.json();
//     return responseData.tracks.items;
//   } catch (error) {
//     console.error("Error fetching songs:", error);
//     return [];
//   }
// };
// export const getSongRequest = async (searchValue: string) => {
//   const url =
// `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(searchValue)}&fmt=json`;
// try { const response = await fetch(url); const responseData = await
// response.json();

//     if (responseData.recordings && responseData.recordings.length > 0) {
//       // Extract song information from response data
//       const songsData: any[] = responseData.recordings.map((recording: any)
// => ({ itemTitle: recording.title, // Add other properties of a song as
// needed })); return songsData; } else { return []; } } catch (error) {
// console.error('Error fetching songs:', error); return []; } }; export const
// getSongDetailsRequest = async (searchValue: string) => { const url =
// `https://www.theaudiodb.com/api/v1/json/2/searchalbum.php?s=${encodeURIComponent(searchValue)}`;
// try { const response = await fetch(url); const responseData = await
// response.json();

//     if (responseData.recordings && responseData.recordings.length > 0) {
//       // Extract song information from response data
//       const songsData: any[] = responseData.recordings.map((recording: any)
// => ({ itemTitle: recording.strAlbum, //artists: recording.artists,
// //duration: recording.duration, date: recording.date, genre:
// recording.strGenre, thumbnailUrl: recording.strAlbumThumb || 'N/A',

//         // Add other properties of a song as needed
//         // Example: duration, artists, release date, etc.
//       }));
//       //console.error(responseData.recordings[0].thumbnailUrl);
//       return songsData;
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error('Error fetching songs:', error);
//     return [];
//   }
// };
// export const getSongRequest = async (searchValue: string) => {
//   const apiKey = '39b4456fdf4d31bd27e1e9759e8f2fd6';
//   const url =
// `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(searchValue)}&api_key=${apiKey}&format=json`;

//   try {
//     const response = await fetch(url);
//     const responseData = await response.json();

//     if (response.ok && responseData.results &&
// responseData.results.trackmatches &&
// responseData.results.trackmatches.track) { // Extract song information from
// response data const songsData: any[] =
// responseData.results.trackmatches.track.map((track: any) => ({ itemTitle:
// track.name, artist: track.artist, thumbnailUrl: track.url, // Add other
// properties of a song as needed })); return songsData; } else { return []; }
// } catch (error) { console.error('Error fetching songs:', error); return [];
// } };
// export const getSongRequest = async (songTitle: string) => {
//   const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
//     songTitle,
//   )}&entity=song`;

//   try {
//     const response = await fetch(url);
//     const responseData = await response.json();

//     if (
//       response.ok &&
//       responseData.results &&
//       responseData.results.length > 0
//     ) {
//       // Extract song information from response data
//       const songsData: any[] = responseData.results.map((song: any) => ({
//         itemTitle: song.trackName,
//       }));
//       return songsData;
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching songs:", error);
//     return [];
//   }
// };

// export const getSongDetailsRequest = async (songTitle: string) => {
//   const apiKey = '39b4456fdf4d31bd27e1e9759e8f2fd6';
//   //const url =
// `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&track=${encodeURIComponent(songTitle)}&api_key=${apiKey}&format=json`;
// const url =
// `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(songTitle)}&api_key=${apiKey}&format=json`;
// try { const response = await fetch(url); const responseData = await
// response.json();

//     if (response.ok && responseData.results &&
// responseData.results.trackmatches &&
// responseData.results.trackmatches.track) { // Extract song information from
// response data const songsData: any[] =
// responseData.results.trackmatches.track.map((track: any) => ({ itemTitle:
// track.name, artist: track.artist, thumbnailUrl: track.url, // Add other
// properties of a song as needed })); return songsData; } else { return []; }
// } catch (error) { console.error('Error fetching songs:', error); return [];
// } };

// Modify the function to query an appropriate endpoint for song details
// export const getSongDetailsRequest = async (searchValue: string) => {
//   const url =
// `https://www.theaudiodb.com/api/v1/json/2/searchalbum.php?s=${encodeURIComponent(searchValue)}`;
// try { const response = await fetch(url); const responseData = await
// response.json();

//     if (responseData.album && responseData.album.length > 0) {
//       // Extract song information from response data
//       const songsData: any[] = responseData.album.map((album: any) => ({
//         itemTitle: album.strAlbum,
//         // Add other properties of a song as needed
//         // Example: duration, artists, release date, etc.
//       }));
//       return songsData;
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error('Error fetching songs:', error);
//     return [];
//   }
// };

// export const getSongRequest = async (searchValue: string) => {
// //   const apiKey = '0624c037fc65b46656d9d979053d140a'; // Replace with your
// YouTube API key //   const url =
// `https://api.musixmatch.com/ws/1.1/track.search?q=${encodeURIComponent(searchValue)}&apikey=${apiKey}`;

// //   try {
// //     const response = await fetch(url);
// //     const responseData = await response.json();

// //     if (responseData.message.body.track_list) {
// //       // Extract song information from response data
// //       const songsData: any[] =
// responseData.message.body.track_list.map((item: any) => ({ //
// trackName: item.track.track_name, //         artistName:
// item.track.artist_name, //         albumName: item.track.album_name, //
//    // Add other properties of a song as needed //       })); //       return
// songsData; //     } else { //       console.error('No songs found.'); //
//   return []; //     } //   } catch (error) { //     console.error('Error
// fetching songs:', error); //     return []; //   } // }; const apiUrl =
// `https://musicbrainz.org/ws/2/recording/?query=<song_name>&fmt=json` //const
// apiUrl =
// `https://www.theaudiodb.com/api/v1/json/2/track.php?a=${encodeURIComponent(searchValue)}`;

//   try {
//     const response = await fetch(apiUrl);
//     const text = await response.text();

//     // Log the response text for debugging
//     console.log('API Response:', text);

//     const data = JSON.parse(text);

//     // Check if the response contains tracks
//     if (data.track) {
//       // Extract relevant track information
//       const tracks = data.track.map((track: { strTrack: any; intTrackNumber:
// any; }) => ({ trackTitle: track.strTrack, trackNumber: track.intTrackNumber
// })); return tracks; } else { console.error('No tracks found for the
// album.'); return []; } } catch (error) { console.error('Error fetching
// tracks:', error); return []; } }

// export const getSongRequest = async (searchValue: string, accessToken:
// string) => { try { const response = await fetch(
// `https://api.spotify.com/v1/search?q=${encodeURIComponent( searchValue,
// )}&type=track`, { headers: { Authorization: `Bearer ${accessToken}`, }, },
// );

//     if (!response.ok) {
//       throw new Error("Failed to fetch songs");
//     }

//     const responseData = await response.json();

//     if (responseData.tracks && responseData.tracks.items) {
//       // Extract song information from response data
//       const songsData: any[] = responseData.tracks.items.map((item: any) =>
// ({ itemTitle: item.name, // Add other properties of a song as needed }));
// return songsData; } else { console.error('No songs found.'); return []; } }
// catch (error) { console.error("Error fetching songs:", error); return []; }
// };

// export const getSongDetailsRequest = async (searchValue: string,
// accessToken: string) => { try { const response = await
// getSongRequest(searchValue, accessToken); // Assuming you already have the
// getSongRequest function

//     // Assuming response is an array of tracks/items
//     if (Array.isArray(response) && response.length > 0) {
//       // Extract song information from response data
//       const songData: any[] = response.map((item: any) => ({
//         itemTitle: item.name,
//         thumbnailUrl: item.album.images.length > 0 ?
// item.album.images[0].url : 'N/A', artists: item.artists.map((artist: any) =>
// artist.name).join(', '), album: item.album.name, duration:
// millisecondsToMinutesSeconds(item.duration_ms), // Assuming you have a
// function to convert milliseconds to minutes:seconds // Add other properties
// of a song as needed })); return songData; } else { console.error('Songs not
// found.'); return []; } } catch (error) { console.error('Error fetching
// songs:', error); return []; } };

// // Function to convert milliseconds to minutes:seconds
// const millisecondsToMinutesSeconds = (milliseconds: number) => {
//   const minutes = Math.floor(milliseconds / 60000);
//   const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
//   return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
// };
const accessToken =
  "BQBlSNBq-FBxW9SVDsp9Xy68PzCZs8pIhpWKG7qfi935HmxvtijCEBTwaSV9rjM8EQVbXdjvlzjJPHg3ne_T2q9NcKWELDFHF588Fdix-DabI8GAep4";
export const getSongRequest = async (searchValue: string) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchValue,
      )}&type=track`,
      {headers: {Authorization: `Bearer ${accessToken}`}},
    );

    if (!response.ok) {
      throw new Error("Failed to fetch songs");
    }

    const responseData = await response.json();
    return responseData.tracks.items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

// export const getSongDetailsRequest = async (songTitle: string) => {
//   const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
//     songTitle,
//   )}&entity=song`;
//   const millisToMinutesAndSeconds = (millis: number) => {
//     const minutes = Math.floor(millis / 60000);
//     const seconds = ((millis % 60000) / 1000).toFixed(0);
//     return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
//   };
//   const millisToSeconds = (millis: number): number => {
//     return Math.floor(millis / 1000);
//   };
//   try {
//     const response = await fetch(url);
//     const responseData = await response.json();

//     if (
//       response.ok &&
//       responseData.results &&
//       responseData.results.length > 0
//     ) {
//       // Extract song information from response data
//       const songsData: any[] = responseData.results.map((song: any) => ({
//         album: song.collectionName,
//         srcId: "song+" + song.trackId.toString(),
//         itemTitle: song.trackName,
//         artist: song.artistName,
//         thumbnailUrl: song.artworkUrl100, // Use artworkUrl100 for thumbnail
//         genre: song.primaryGenreName, // Genre information
//         releaseDate: song.releaseDate,
//         language: song.language ? song.language : "English",
//         duration: millisToSeconds(song.trackTimeMillis), // Duration
//         // in
//         // milliseconds
//         // Add other properties of a song as needed
//       }));
//       return songsData;
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching songs:", error);
//     return [];
//   }
// };
export const getSongDetailsRequest = async (songTitle: string) => {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(songTitle)}&type=track`;
  const millisToMinutesAndSeconds = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };
  const millisToSeconds = (millis: number): number => {
    return Math.floor(millis / 1000);
  };
  try {
    const accessToken = await getSpotifyTokens();
    //const accessToken = 'BQBlSNBq-FBxW9SVDsp9Xy68PzCZs8pIhpWKG7qfi935HmxvtijCEBTwaSV9rjM8EQVbXdjvlzjJPHg3ne_T2q9NcKWELDFHF588Fdix-DabI8GAep4';
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const responseData = await response.json();

    if (
      response.ok &&
      responseData.tracks &&
      responseData.tracks.items.length > 0
    ) {
      // Extract song information from response data
      const songsData: any[] = responseData.tracks.items.map((song: any) => ({
        album: song.album.name,
        srcId: "song+" + song.id,
        itemTitle: song.name,
        // artist: song.artists.map((artist: any) => artist.name).join(", "),
        thumbnailUrl:
          song.album.images.length > 0 ? song.album.images[0].url : "", // Use the first image as thumbnail
        // genre: song.album.genres ? song.album.genres.join(", ") : "", // Check if genres exist before joining
        releaseDate: song.album.release_date,
        language: "English", // Spotify doesn't provide language information directly
        duration: millisToSeconds(song.duration_ms), // Duration in milliseconds
        // Add other properties of a song as needed
      }));
      return songsData;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export const getSongDetailsRequestById = async (srcId: string) => {
  //Split the input
  console.log(srcId);
  const parts = srcId.split("+");
  const id = parts[1];
  const url = `https://api.spotify.com/v1/tracks/${encodeURIComponent(id)}`;
  const millisToSeconds = (millis: number): number => {
    return Math.floor(millis / 1000);
  };
  try {
    const accessToken = await getSpotifyTokens();
    //const accessToken = 'BQD6Bu3aWDv-JP9XURMl-2qiot8YQdeBygGZMwRVnNZaeHNYEFQw58PzigANHPtUrTv0HtgFjI-zfy82JrYDNNByHPCvHmSKSIY5pxyc8b5adRMiaqc';
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // console.log("Response status:", response.ok);

    const responseData = await response.json();
    const artist_id = responseData?.artists?.map((artist: any) => artist.id);
    const url2 = `https://api.spotify.com/v1/artists/${encodeURIComponent(artist_id)}`;
    const response2 = await fetch(url2, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const responseData2 = await response2.json();
    // console.log("Response data:", responseData);

    if (response.ok) {
      // Check if responseData and its nested properties exist before accessing them
      const songData = {
        album: responseData?.album?.name || "",
        srcId: id,
        itemTitle: responseData?.name || "",
        artists:
          responseData?.artists?.map((artist: any) => artist.name).join(", ") ||
          "",
        thumbnailUrl: responseData?.album?.images?.[0]?.url || "",
        genre: responseData2?.genres?.join(", ") || "",
        //genre: responseData?.artists?.map((artist: any) => artist.genres).join(", ")|| responseData, // Check if artists and genres exist
        releaseDate: responseData?.album?.release_date || "",
        language: "English",
        duration: millisToSeconds(responseData.duration_ms),
      };
      return songData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching song details:", error);
    return null;
  }
};
