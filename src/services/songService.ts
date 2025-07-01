import { PrismaClient, Song, User } from "@prisma/client";
import { removeVietnameseTones } from "../utils/removeTone";
import { getPagination, PaginationParams } from "../utils/pagination";
import { PaginationResult } from "../utils/paginationResult";
import { CustomError } from "../utils/customError";
import { StatusCodes } from "http-status-codes";
import { makePaginationResult } from "../utils/makePaginationResult";

const prisma = new PrismaClient();

const getSongsService = async ({ keyword, page, limit }: PaginationParams): Promise<PaginationResult<any>> => {
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

  return makePaginationResult(data, total, take, currentPage);
};

// services/songService.ts
const addFavoriteSongService = async (userId: number, songId: number) => {
  // Kiểm tra bài hát có tồn tại không
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Song not found");
  }

  // Kiểm tra xem bài hát đã được yêu thích chưa
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { favorites: true },
  });

  if (user?.favorites.some((fav: { id: number }) => fav.id === songId)) {
    throw new CustomError(StatusCodes.CONFLICT, "Song already in favorites");
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
    throw new CustomError(StatusCodes.NOT_FOUND, "Song is not in favorite list");
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
}: PaginationParams): Promise<PaginationResult<any>> => {
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

  return makePaginationResult(data, total, take, currentPage);
};

const getPlaybackHistoryService = async ({
  userId,
  page,
  limit,
}: PaginationParams): Promise<PaginationResult<any>> => {
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

  return makePaginationResult(data, total, take, currentPage);
};

const getTopSongsByListensService = async ({ page, limit }: PaginationParams): Promise<PaginationResult<any>> => {
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
    return makePaginationResult([], total, take, currentPage);
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

  return makePaginationResult(data, total, take, currentPage);
};

const getTopSongsByGenreService = async ({ genre, page, limit }: { genre: string, page?: number, limit?: number }): Promise<PaginationResult<any>> => {
  const { skip, take, currentPage } = getPagination({ page, limit });

  // 1. Lấy tất cả các bản ghi lượt nghe được nhóm theo bài hát và thể loại để tính tổng số lượt nghe theo từng bài hát
  const allPlaybackHistory = await prisma.playbackHistory.findMany({
    where: {
      song: {
        genre: genre,
      },
    },
    include: {
      song: {
        include: {
          artist: true,
        },
      },
    },
  });

  // 2. Tính toán tổng lượt nghe cho mỗi bài hát trong thể loại đó
  const songListenCounts: { [songId: number]: { count: number, songDetails: any } } = {};
  allPlaybackHistory.forEach(history => {
    if (history.song) {
      if (!songListenCounts[history.song.id]) {
        songListenCounts[history.song.id] = { count: 0, songDetails: history.song };
      }
      songListenCounts[history.song.id].count++;
    }
  });

  // 3. Chuyển đổi thành mảng và sắp xếp theo lượt nghe giảm dần
  const sortedSongs = Object.values(songListenCounts)
    .sort((a, b) => b.count - a.count)
    .map(item => ({ ...item.songDetails, listenCount: item.count }));

  const total = sortedSongs.length;
  const totalPages = Math.ceil(total / take);

  // 4. Áp dụng phân trang
  const data = sortedSongs.slice(skip, skip + take);

  return makePaginationResult(data, total, take, currentPage);
};


const playSongService = async (userId: number, songId: number) => {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Song not found");
  }

  // Check if a playback history entry for this user and song already exists
  const existingPlayback = await prisma.playbackHistory.findFirst({
    where: {
      userId: userId,
      songId: songId,
    },
  });

  if (existingPlayback) {
    // If it exists, update the playedAt timestamp
    await prisma.playbackHistory.update({
      where: { id: existingPlayback.id },
      data: {
        playedAt: new Date(),
      },
    });
  } else {
    // If it doesn't exist, create a new entry
    await prisma.playbackHistory.create({
      data: {
        userId,
        songId,
      },
    });
  }

  return { message: "Playback recorded successfully.", songId };
};

const deleteOldPlaybackHistory = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await prisma.playbackHistory.deleteMany({
    where: {
      playedAt: {
        lt: sevenDaysAgo,
      },
    },
  });

  console.log(`Deleted ${result.count} old playback history records.`);
  return result.count;
};


export {
  getSongsService,
  addFavoriteSongService,
  deleteFavoriteSongService,
  getFavoriteSongsService,
  getPlaybackHistoryService,
  getTopSongsByListensService,
  getTopSongsByGenreService,
  playSongService,
  deleteOldPlaybackHistory,
};
