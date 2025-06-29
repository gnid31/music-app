// src/services/playlistService.ts
import { PrismaClient, Playlist } from "@prisma/client";
import { getPagination, PaginationParams } from "../utils/pagination";
import { CustomError } from "../utils/customError";
import { StatusCodes } from "http-status-codes";

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
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('userId_name')) {
      throw new CustomError(StatusCodes.CONFLICT, "Playlist with this name already exists for this user.");
    }
    console.error("Error creating playlist:", error);
    throw error;
  }
};

const updatePlaylistNameService = async (
  playlistId: number,
  newName: string,
  userId: any
): Promise<Playlist> => {
  try {
    // Tìm playlist
    const playlistToUpdate = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: userId },
    });

    if (!playlistToUpdate) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Playlist not found or unauthorized");
    }

    // Cập nhật tên playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: { name: newName },
    });
    return updatedPlaylist;
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('userId_name')) {
      throw new CustomError(StatusCodes.CONFLICT, "Playlist with this name already exists for this user.");
    }
    console.error("Error updating playlist name:", error);
    throw error;
  }
};

const deletePlaylistService = async (
  playlistId: number,
  userId: number
): Promise<Playlist> => {
  // Tìm playlist có id và thuộc về userId
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      userId: userId,
    },
  });

  if (!playlist) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Playlist not found or unauthorized");
  }

  // Xoá playlist dựa trên id
  const deleted = await prisma.playlist.delete({
    where: { id: playlistId },
  });

  return deleted;
};

const addSongToPlaylistService = async (
  playlistId: number,
  songId: number,
  userId: number
) => {
  // Kiểm tra playlist có tồn tại và thuộc về user
  const playlistToAdd = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: userId },
  });

  if (!playlistToAdd) {
    // Không tìm thấy playlist hoặc không phải của user
    throw new CustomError(StatusCodes.NOT_FOUND, "Playlist not found or unauthorized");
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
    throw new CustomError(StatusCodes.CONFLICT, "Song already in playlist");
  }

  // Thêm bài hát vào playlist
  const addedSong = await prisma.playlistSong.create({
    data: {
      playlistId,
      songId,
    },
  });

  return addedSong;
};

const deleteSongToPlaylistService = async (
  playlistId: number,
  songId: number,
  userId: any
) => {
  // Check playlist and song existence
  // Kiểm tra playlist có tồn tại và thuộc về user
  const playlistToDelete = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: userId },
  });

  if (!playlistToDelete) {
    // Không tìm thấy playlist hoặc không phải của user
    throw new CustomError(StatusCodes.NOT_FOUND, "Playlist not found or unauthorized");
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
    throw new CustomError(StatusCodes.NOT_FOUND, "Song doesn't exist in playlist");
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
    throw new CustomError(StatusCodes.NOT_FOUND, "Playlist not found or unauthorized");
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
    playlistSongs: data,
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
