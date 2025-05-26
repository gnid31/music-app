// src/services/playlistService.ts
import { PrismaClient, Playlist } from "@prisma/client";

const prisma = new PrismaClient();

const createPlaylistService = async (
  name: string,
  userId: number
): Promise<Playlist> => {
  try {
    const newPlaylist = await prisma.playlist.create({
      data: {
        name,
        userId,
      },
    });
    return newPlaylist;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

const updatePlaylistNameService = async (
  playlistId: number,
  newName: string,
  userId: any
): Promise<Playlist | null> => {
  try {
    // Tìm playlist
    const playlistToUpdate = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: userId },
    });

    if (!playlistToUpdate) {
      return null; // Không tìm thấy playlist
    }

    // Cập nhật tên playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: { name: newName },
    });
    return updatedPlaylist;
  } catch (error) {
    console.error("Error updating playlist name:", error);
    throw error;
  }
};

const deletePlaylistService = async (playlistId: number, userId: any): Promise<Playlist> => {
  try {
    const deletePlaylist = await prisma.playlist.delete({
      where: { id: playlistId, userId: userId },
    });
    return deletePlaylist;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

export {
  createPlaylistService,
  updatePlaylistNameService,
  deletePlaylistService,
};
