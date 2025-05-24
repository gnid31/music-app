import { PrismaClient, Song } from "@prisma/client";

const prisma = new PrismaClient();

const getSongByIdService = async (id: number): Promise<Song | null> => {
  try {
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
        playlists: true,
      },
    });
    return song;
  } catch (error) {
    console.error("Error fetching song:", error);
    throw error;
  }
};

const getAllSongsService = async (): Promise<Song[]> => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        artist: true,
        playlists: true,
      },
    });
    return songs;
  } catch (error) {
    console.error("Error fetching all songs:", error);
    throw error;
  }
};

export { getSongByIdService, getAllSongsService };
