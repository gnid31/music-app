import { PrismaClient, Song } from "@prisma/client";
import { removeVietnameseTones } from "../utils/removeTone";
import { getPagination, parsePaginationParams } from "../utils/pagination";

const prisma = new PrismaClient();

const getSongByIdService = async (id: number): Promise<Song | null> => {
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

// const getSongsService = async ({
//   keyword,
// }: {
//   keyword?: string;
// }): Promise<Song[]> => {
//   try {
//     const normalized = keyword
//       ? removeVietnameseTones(keyword.trim())
//       : undefined;

//     const whereCondition = normalized
//       ? {
//           OR: [
//             {
//               titleNormalized: {
//                 contains: normalized,
//               },
//             },
//             {
//               artist: {
//                 is: {
//                   nameNormalized: {
//                     contains: normalized,
//                   },
//                 },
//               },
//             },
//           ],
//         }
//       : undefined;

//     const songs = await prisma.song.findMany({
//       where: whereCondition,
//       include: {
//         artist: true,
//         playlists: true,
//       },
//       take: normalized ? 10 : undefined, // Giới hạn nếu có keyword, không thì lấy hết
//     });

//     return songs;
//   } catch (error) {
//     console.error("Error in searchSongsService:", error);
//     throw error;
//   }
// };

const getSongsService = async ({
  keyword,
  page,
  limit,
}: {
  keyword?: string;
  page?: number;
  limit?: number;
}) => {
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

export { getSongByIdService, getSongsService };
