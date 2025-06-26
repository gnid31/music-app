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

const getTopSongsByListensService = async ({ page, limit }: PaginationParams) => {
  const { skip, take, currentPage } = getPagination({ page, limit });

  // 1. Lấy tất cả các bản ghi lượt nghe được nhóm theo bài hát để tính tổng số bài hát duy nhất và sau đó phân trang
  const allTopSongsRaw = await prisma.playbackHistory.groupBy({
    by: ['songId'],
    _count: {
      songId: true,
    },
    orderBy: {
      _count: {
        songId: 'desc',
      },
    },
  });

  const total = allTopSongsRaw.length; // Tổng số bài hát duy nhất có lượt nghe
  const totalPages = Math.ceil(total / take);

  // 2. Áp dụng phân trang cho danh sách songId đã sắp xếp
  const paginatedSongIdsRaw = allTopSongsRaw.slice(skip, skip + take);
  const songIds = paginatedSongIdsRaw.map(item => item.songId);

  if (songIds.length === 0) {
    return {
      data: [],
      limit: take,
      total: total,
      totalPages: totalPages,
      currentPage: currentPage,
    };
  }

  // 3. Lấy thông tin chi tiết của các bài hát đã được phân trang
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

  // 4. Kết hợp số lượt nghe và sắp xếp lại
  const data = songsWithDetails.map(song => {
    const countData = paginatedSongIdsRaw.find(item => item.songId === song.id);
    return {
      ...song,
      listenCount: countData ? countData._count.songId : 0,
    };
  }).sort((a, b) => b.listenCount - a.listenCount); // Sắp xếp lại để đảm bảo thứ tự chính xác

  return {
    data,
    limit: take,
    total,
    totalPages,
    currentPage,
  };
};

// New service function: get top songs by listens for a specific genre, with pagination
const getTopSongsByGenreService = async ({ genre, page, limit }: { genre: string, page?: number, limit?: number }) => {
  const { skip, take, currentPage } = getPagination({ page, limit });

  // Lấy tất cả các bản ghi playbackHistory của các bài hát thuộc genre này
  const allTopSongsRaw = await prisma.playbackHistory.findMany({
    where: {
      song: {
        genre: genre,
      },
    },
    select: {
      songId: true,
    },
  });

  // Đếm số lượt nghe cho từng songId
  const listenCounts: { [songId: number]: number } = {};
  allTopSongsRaw.forEach(item => {
    listenCounts[item.songId] = (listenCounts[item.songId] || 0) + 1;
  });

  // Sắp xếp songId theo lượt nghe giảm dần
  const sortedSongIds = Object.entries(listenCounts)
    .map(([songId, count]) => ({ songId: Number(songId), listenCount: count }))
    .sort((a, b) => b.listenCount - a.listenCount);

  const total = sortedSongIds.length;
  const totalPages = Math.ceil(total / take);
  const paginatedSongIds = sortedSongIds.slice(skip, skip + take);
  const songIds = paginatedSongIds.map(item => item.songId);

  if (songIds.length === 0) {
    return {
      genre,
      data: [],
      limit: take,
      total,
      totalPages,
      currentPage,
    };
  }

  // Lấy thông tin chi tiết các bài hát
  const songsWithDetails = await prisma.song.findMany({
    where: { id: { in: songIds } },
    include: { artist: true },
  });

  // Kết hợp listenCount
  const data = songsWithDetails.map(song => {
    const countData = paginatedSongIds.find(item => item.songId === song.id);
    return {
      ...song,
      listenCount: countData ? countData.listenCount : 0,
    };
  }).sort((a, b) => b.listenCount - a.listenCount);

  return {
    genre,
    data,
    limit: take,
    total,
    totalPages,
    currentPage,
  };
};

// API: Lấy danh sách các thể loại có trong hệ thống
const getAllGenresService = async () => {
  const genres = await prisma.song.findMany({
    distinct: ['genre'],
    select: { genre: true },
    where: { genre: { not: '' } },
  });
  return genres.map(g => g.genre).filter(Boolean);
};

// API: Lấy danh sách các thể loại, mỗi thể loại trả về top bài hát theo phân trang
const getTopGenresByListensService = async ({ genre, page, limit }: { genre?: string, page?: number, limit?: number }) => {
  if (genre) {
    // Nếu truyền genre, trả về top bài hát của genre đó (phân trang)
    return getTopSongsByGenreService({ genre, page, limit });
  }
  // Nếu không truyền genre, trả về danh sách các genre
  const genres = await getAllGenresService();
  return genres;
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
