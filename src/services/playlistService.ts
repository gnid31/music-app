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
  newName: string
): Promise<Playlist | null> => {
  try {
    // Tìm playlist và kiểm tra xem người dùng có phải chủ sở hữu không
    const playlistToUpdate = await prisma.playlist.findUnique({
      where: { id: playlistId },
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

export { createPlaylistService, updatePlaylistNameService };
