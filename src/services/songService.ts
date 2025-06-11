import { PrismaClient, Song, User } from "@prisma/client";
import { removeVietnameseTones } from "../utils/removeTone";
import { getPagination, PaginationParams } from "../utils/pagination";

const prisma = new PrismaClient();

const getSongByIdService = async (id: any): Promise<Song | null> => {
  try {
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
      },
    });
    return song;
  } catch (error) {
    console.error("Error fetching song:", error);
    throw error;
  }
};

const getSongsService = async ({ keyword, page, limit }: PaginationParams) => {
  const { skip, take, currentPage } = getPagination({ page, limit });

  const normalized = keyword ? removeVietnameseTones(keyword) : undefined;

  const where = normalized
    ? {
        OR: [
          { titleNormalized: { contains: normalized } },
          {
            artist: {
              is: { nameNormalized: { contains: normalized } },
            },
          },
        ],
      }
    : undefined;

  const [data, total] = await Promise.all([
    prisma.song.findMany({
      where,
      skip,
      take,
      include: { artist: true, playlists: true },
    }),
    prisma.song.count({ where }),
  ]);

  return {
    data,
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    currentPage,
  };
};

// services/songService.ts
const addFavoriteSongService = async (userId: number, songId: number) => {
  // Kiểm tra bài hát có tồn tại không
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    throw new Error("Song not found");
  }

  // Kiểm tra xem bài hát đã được yêu thích chưa
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favorites: true },
  });

  if (user?.favorites.some((fav: { id: number }) => fav.id === songId)) {
    throw new Error("Song already in favorites");
  }

  // Thêm bài hát vào mục yêu thích
  await prisma.user.update({
    where: { id: userId },
    data: {
      favorites: {
        connect: { id: songId },
      },
    },
  });

  return { message: "Song added to favorites", songId };
};

const deleteFavoriteSongService = async (userId: number, songId: number) => {
  // Kiểm tra xem bài hát có nằm trong danh sách yêu thích không
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: {
        where: { id: songId },
        select: { id: true },
      },
    },
  });

  if (!user || user.favorites.length === 0) {
    throw new Error("Song is not in favorite list");
  }

  // Xoá quan hệ yêu thích
  await prisma.user.update({
    where: { id: userId },
    data: {
      favorites: {
        disconnect: { id: songId },
      },
    },
  });

  return { message: "Removed from favorites", songId };
};

const getFavoriteSongsService = async ({
  userId,
  page,
  limit,
}: PaginationParams) => {
  const { skip, take, currentPage } = getPagination({ page, limit });
  const [data, total] = await Promise.all([
    prisma.song.findMany({
      where: {
        usersWhoFavorited: {
          some: {
            id: userId,
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        artist: true,
      },
    }),
    prisma.song.count({
      where: {
        usersWhoFavorited: {
          some: {
            id: userId,
          },
        },
      },
    }),
  ]);

  return {
    data,
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    currentPage,
  };
};

const getPlaybackHistoryService = async ({
  userId,
  page,
  limit,
}: PaginationParams) => {
  const { skip, take, currentPage } = getPagination({ page, limit });

  const [data, total] = await Promise.all([
    prisma.playbackHistory.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
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
    prisma.playbackHistory.count({ where: { userId } }),
  ]);

  return {
    data,
    total,
    currentPage,
    totalPages: Math.ceil(total / take),
    limit: take,
  };
};

const playSongService = async (userId: number, songId: number) => {
  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: {
      id: true,
      url: true,
    },
  });

  if (!song) {
    throw new Error("Song not found");
  }

  // Xoá bản ghi lịch sử cũ (nếu có)
  await prisma.playbackHistory.deleteMany({
    where: {
      userId,
      songId,
    },
  });
  // Ghi lại lịch sử phát nhạc
  await prisma.playbackHistory.create({
    data: {
      userId,
      songId,
    },
  });

  return song;
};

export {
  getSongByIdService,
  getSongsService,
  addFavoriteSongService,
  deleteFavoriteSongService,
  getFavoriteSongsService,
  getPlaybackHistoryService,
  playSongService,
};
