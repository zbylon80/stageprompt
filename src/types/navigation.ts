// types/navigation.ts

import { Song } from './models';

export type RootStackParamList = {
  SongList: undefined;
  SongEditor: { song?: Song };
  SetlistEditor: { setlistId?: string };
  Prompter: { songId: string; setlistId?: string };
  Settings: undefined;
};
