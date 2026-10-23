export type Video = {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  unavailable?: boolean;
};

export type Playlist = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videos: Video[];
};

export type StudyDay = {
  date: Date;
  videos: Video[];
  duration: number;
  marathon: boolean;
};

export type Mode = "playlist" | "video" | "channel";
