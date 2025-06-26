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

const getTopSongsByListensService = async (limit: number = 50) => {
  const topSongsRaw = await prisma.playbackHistory.groupBy({
    by: ['songId'],
    _count: {
      songId: true,
    },
    orderBy: {
      _count: {
        songId: 'desc',
      },
    },
    take: limit,
  });

  const songIds = topSongsRaw.map(item => item.songId);

  if (songIds.length === 0) {
    return [];
  }

  const songsWithDetails = await prisma.song.findMany({
    where: {
      id: {
        in: songIds,
      },
    },
    include: {
      artist: true,
    },
  });

  const result = songsWithDetails.map(song => {
    const countData = topSongsRaw.find(item => item.songId === song.id);
    return {
      ...song,
      listenCount: countData ? countData._count.songId : 0,
    };
  }).sort((a, b) => b.listenCount - a.listenCount);

  return result;
};

// New service function to get top genres by listens in the last week
const getTopGenresByListensService = async (limit: number = 50) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get playback history for the last week, including song genre
  const recentPlaybackHistory = await prisma.playbackHistory.findMany({
    where: {
      playedAt: {
        gte: oneWeekAgo, // Greater than or equal to one week ago
      },
    },
    include: {
      song: {
        select: {
          genre: true,
        },
      },
    },
  });

  // Aggregate listen counts by genre
  const genreListenCounts: { [key: string]: number } = {};
  recentPlaybackHistory.forEach(record => {
    const genre = record.song.genre;
    if (genre) {
      genreListenCounts[genre] = (genreListenCounts[genre] || 0) + 1;
    }
  });

  // Convert to an array of objects and sort by listen count
  const sortedGenres = Object.entries(genreListenCounts)
    .map(([genre, listenCount]) => ({ genre, listenCount }))
    .sort((a, b) => b.listenCount - a.listenCount);

  return sortedGenres.slice(0, limit); // Return top 'limit' genres
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

  // Xóa các bản ghi lịch sử đã cũ hơn 1 tuần
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Set date to 7 days ago

  await prisma.playbackHistory.deleteMany({
    where: {
      userId: userId,
      playedAt: {
        lt: oneWeekAgo, // Less than one week ago
      },
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
  getTopSongsByListensService,
  getTopGenresByListensService,
  playSongService,
};
