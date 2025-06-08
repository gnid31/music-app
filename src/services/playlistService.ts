// src/services/playlistService.ts
import { PrismaClient, Playlist } from "@prisma/client";
import { getPagination, PaginationParams } from "../utils/pagination";

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

const deletePlaylistService = async (
  playlistId: number,
  userId: any
): Promise<Playlist> => {
  try {
    const deletePlaylist = await prisma.playlist.delete({
      where: { id: playlistId, userId: userId },
    });
    return deletePlaylist;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
};

const addSongToPlaylistService = async (
  playlistId: number,
  songId: number,
  userId: number
) => {
  try {
    // Kiểm tra playlist có tồn tại và thuộc về user
    const playlistToAdd = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: userId },
    });

    if (!playlistToAdd) {
      // Không tìm thấy playlist hoặc không phải của user
      throw new Error("Playlist not found or unauthorized");
    }

    // Kiểm tra xem bài hát đã tồn tại trong playlist chưa
    const exists = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    if (exists) {
      throw new Error("Song already in playlist");
    }

    // Thêm bài hát vào playlist
    const addedSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
    });

    return addedSong;
  } catch (error) {
    // Log lỗi để debug
    console.error("Error in addSongToPlaylistService:", error);
    // Ném lỗi ra ngoài để controller hoặc middleware xử lý
    throw error;
  }
};

const deleteSongToPlaylistService = async (
  playlistId: number,
  songId: number,
  userId: any
) => {
  // Check playlist and song existence
  try {
    // Kiểm tra playlist có tồn tại và thuộc về user
    const playlistToDelete = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: userId },
    });

    if (!playlistToDelete) {
      // Không tìm thấy playlist hoặc không phải của user
      throw new Error("Playlist not found or unauthorized");
    }

    // Kiểm tra xem bài hát đã tồn tại trong playlist chưa
    const exists = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    if (!exists) {
      throw new Error("Song doesn't exist in playlist");
    }

    // Xoá bài hát khỏi playlist
    const deletedSong = await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });
    return deletedSong;
  } catch (error) {
    // Log lỗi để debug
    console.error("Error in deleteSongToPlaylistService:", error);
    // Ném lỗi ra ngoài để controller hoặc middleware xử lý
    throw error;
  }
};

const getPlaylistsService = async (userId: number) => {
  try {
    return await prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    console.error("Error in getPlaylistsService:", error);
    throw error;
  }
};

const getSongsPlaylistService = async ({
  playlistId,
  userId,
  page,
  limit,
}: PaginationParams) => {
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      userId,
    },
  });

  if (!playlist) {
    throw new Error("Playlist not found or unauthorized");
  }

  const { skip, take, currentPage } = getPagination({ page, limit });

  const [data, total] = await Promise.all([
    prisma.playlistSong.findMany({
      where: { playlistId },
      orderBy: { addedAt: "desc" },
      skip,
      take,
      include: {
        song: {
          include: {
            artist: true,
          },
        },
      },
    }),
    prisma.playlistSong.count({ where: { playlistId } }),
  ]);

  return {
    data,
    total,
    currentPage,
    totalPages: Math.ceil(total / take),
    limit: take,
  };
};

export {
  createPlaylistService,
  updatePlaylistNameService,
  deletePlaylistService,
  addSongToPlaylistService,
  deleteSongToPlaylistService,
  getPlaylistsService,
  getSongsPlaylistService,
};
