export type User = {
  id: number;
  email: string;
  name: string;
  //dateJoined: Date;
  dateJoined: string;
  numberOfLikedItem: number;
  numberOfRating: number;
  numberOfFavItem: number;
  timeUsedAppInMins: number;
  history?: SimpleItem[];
  countItemsInLibrary: number;
  preference: string[];
};

export enum ItemType {
  Book,
  Song,
  Movie,
  All,
  Other,
}

export type Folder = {
  id: number;
  name: string;
  isSeries: boolean;
  img: string; // string of the url, maybe a default value, may be upload by
  // user, may be the img of the first item in the folder
  items: SimpleItem[];
};

export type Library = {
  id: number;
  userId: number;
  items: SimpleItem[];
  folders: Folder[];
  series: Folder[];
};

export type OnlineContent = {
  movies?: SimpleItem[];
  songs?: SimpleItem[];
  books?: SimpleItem[];
};

export type SimpleItem = {
  id: number | string;
  title: string;
  img: string; // string of the url
  tag: string[];
  type: ItemType;
};

export interface ItemInfo {
  id: number;
  title: string;
  isInLibrary: boolean;
  img: string; // string of the url
  genre: string[];
  tag: string[];
  country?: string;
  publicationDate?: string;
  type: ItemType; // movie song or book
  otherContent: MovieContent | SongContent | BookContent;
  people: People[];
}

export type People = {
  name: string;
  role: string; // do not leave this null, give some default value, creator for
  // song, movie, author for book.
};

export type MovieContent = {
  duration?: number;
  country?: string;
  description?: string;
};

export type SongContent = {
  duration?: number;
  album?: string;
};

export type BookContent = {
  pageCount?: number;
  description?: string;
};

export interface RecommendationResponse {
  books: string[];
  movies: string[];
  songs: string[];
}

export interface ErrorResponse {
  error: string;
}
