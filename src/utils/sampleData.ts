// utils/sampleData.ts

import { Song, Setlist, SongSection } from '../types/models';
import { generateId } from './idGenerator';

/**
 * Generates sample songs with realistic lyrics and timings
 * to help users understand how the app works
 */
export function generateSampleSongs(): Song[] {
  const now = Date.now();

  const song1: Song = {
    id: generateId(),
    title: 'Amazing Grace',
    artist: 'Traditional',
    durationSeconds: 180,
    lines: [
      {
        id: generateId(),
        text: 'Amazing grace, how sweet the sound',
        timeSeconds: 5,
        section: { type: 'verse', number: 1, startTime: 5, endTime: 25 },
      },
      {
        id: generateId(),
        text: 'That saved a wretch like me',
        timeSeconds: 10,
      },
      {
        id: generateId(),
        text: 'I once was lost, but now am found',
        timeSeconds: 15,
      },
      {
        id: generateId(),
        text: 'Was blind, but now I see',
        timeSeconds: 20,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 25,
      },
      {
        id: generateId(),
        text: "'Twas grace that taught my heart to fear",
        timeSeconds: 30,
        section: { type: 'verse', number: 2, startTime: 30, endTime: 50 },
      },
      {
        id: generateId(),
        text: 'And grace my fears relieved',
        timeSeconds: 35,
      },
      {
        id: generateId(),
        text: 'How precious did that grace appear',
        timeSeconds: 40,
      },
      {
        id: generateId(),
        text: 'The hour I first believed',
        timeSeconds: 45,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 50,
      },
      {
        id: generateId(),
        text: 'Through many dangers, toils and snares',
        timeSeconds: 55,
        section: { type: 'verse', number: 3, startTime: 55, endTime: 75 },
      },
      {
        id: generateId(),
        text: 'I have already come',
        timeSeconds: 60,
      },
      {
        id: generateId(),
        text: "'Tis grace hath brought me safe thus far",
        timeSeconds: 65,
      },
      {
        id: generateId(),
        text: 'And grace will lead me home',
        timeSeconds: 70,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const song2: Song = {
    id: generateId(),
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    durationSeconds: 240,
    lines: [
      {
        id: generateId(),
        text: "I've heard there was a secret chord",
        timeSeconds: 8,
        section: { type: 'verse', number: 1, startTime: 8, endTime: 32 },
      },
      {
        id: generateId(),
        text: 'That David played and it pleased the Lord',
        timeSeconds: 12,
      },
      {
        id: generateId(),
        text: "But you don't really care for music, do you?",
        timeSeconds: 16,
      },
      {
        id: generateId(),
        text: 'It goes like this, the fourth, the fifth',
        timeSeconds: 20,
      },
      {
        id: generateId(),
        text: 'The minor fall, the major lift',
        timeSeconds: 24,
      },
      {
        id: generateId(),
        text: 'The baffled king composing Hallelujah',
        timeSeconds: 28,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 32,
      },
      {
        id: generateId(),
        text: 'Hallelujah, Hallelujah',
        timeSeconds: 36,
        section: { type: 'chorus', startTime: 36, endTime: 48 },
      },
      {
        id: generateId(),
        text: 'Hallelujah, Hallelujah',
        timeSeconds: 40,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 48,
      },
      {
        id: generateId(),
        text: 'Your faith was strong but you needed proof',
        timeSeconds: 52,
        section: { type: 'verse', number: 2, startTime: 52, endTime: 76 },
      },
      {
        id: generateId(),
        text: 'You saw her bathing on the roof',
        timeSeconds: 56,
      },
      {
        id: generateId(),
        text: 'Her beauty and the moonlight overthrew you',
        timeSeconds: 60,
      },
      {
        id: generateId(),
        text: 'She tied you to a kitchen chair',
        timeSeconds: 64,
      },
      {
        id: generateId(),
        text: 'She broke your throne, she cut your hair',
        timeSeconds: 68,
      },
      {
        id: generateId(),
        text: 'And from your lips she drew the Hallelujah',
        timeSeconds: 72,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 76,
      },
      {
        id: generateId(),
        text: 'Hallelujah, Hallelujah',
        timeSeconds: 80,
        section: { type: 'chorus', startTime: 80, endTime: 92 },
      },
      {
        id: generateId(),
        text: 'Hallelujah, Hallelujah',
        timeSeconds: 84,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const song3: Song = {
    id: generateId(),
    title: 'Somewhere Over the Rainbow',
    artist: 'Harold Arlen',
    durationSeconds: 150,
    lines: [
      {
        id: generateId(),
        text: 'Somewhere over the rainbow',
        timeSeconds: 5,
        section: { type: 'verse', number: 1, startTime: 5, endTime: 25 },
      },
      {
        id: generateId(),
        text: 'Way up high',
        timeSeconds: 9,
      },
      {
        id: generateId(),
        text: "There's a land that I heard of",
        timeSeconds: 13,
      },
      {
        id: generateId(),
        text: 'Once in a lullaby',
        timeSeconds: 17,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 25,
      },
      {
        id: generateId(),
        text: 'Somewhere over the rainbow',
        timeSeconds: 30,
        section: { type: 'verse', number: 2, startTime: 30, endTime: 50 },
      },
      {
        id: generateId(),
        text: 'Skies are blue',
        timeSeconds: 34,
      },
      {
        id: generateId(),
        text: 'And the dreams that you dare to dream',
        timeSeconds: 38,
      },
      {
        id: generateId(),
        text: 'Really do come true',
        timeSeconds: 42,
      },
      {
        id: generateId(),
        text: '',
        timeSeconds: 50,
      },
      {
        id: generateId(),
        text: 'Someday I wish upon a star',
        timeSeconds: 55,
        section: { type: 'bridge', startTime: 55, endTime: 75 },
      },
      {
        id: generateId(),
        text: 'And wake up where the clouds are far behind me',
        timeSeconds: 60,
      },
      {
        id: generateId(),
        text: 'Where troubles melt like lemon drops',
        timeSeconds: 65,
      },
      {
        id: generateId(),
        text: "Away above the chimney tops, that's where you'll find me",
        timeSeconds: 70,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  return [song1, song2, song3];
}

/**
 * Generates a sample setlist containing the sample songs
 */
export function generateSampleSetlist(songIds: string[]): Setlist {
  const now = Date.now();

  return {
    id: generateId(),
    name: 'Sample Performance',
    songIds: songIds,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Checks if this is the first run of the app by checking if any songs exist
 */
export async function isFirstRun(loadSongs: () => Promise<Song[]>): Promise<boolean> {
  try {
    const songs = await loadSongs();
    return songs.length === 0;
  } catch (error) {
    console.error('Error checking first run:', error);
    return false;
  }
}

/**
 * Loads sample data into the app
 * Returns the generated songs and setlist
 */
export function getSampleData(): { songs: Song[]; setlist: Setlist } {
  const songs = generateSampleSongs();
  const songIds = songs.map((song) => song.id);
  const setlist = generateSampleSetlist(songIds);

  return { songs, setlist };
}
