import { Request, Response, NextFunction } from "express";
import {
  getSongsService,
  getSongByIdService,
  addFavoriteSongService,
  deleteFavoriteSongService,
  getFavoriteSongsService,
  getPlaybackHistoryService,
  playSongService,
  getTopSongsByListensService,
  getTopSongsByGenreService,
} from "../services/songService";
import { StatusCodes } from "http-status-codes";
import { parsePaginationParams } from "../utils/pagination";
import { CustomError } from "../utils/customError";

/**
 * @swagger
 * /api/songs/{songId}:
 *   get:
 *     summary: Lấy thông tin bài hát theo ID
 *     description: Trả về thông tin chi tiết của bài hát dựa trên ID.
 *     tags:
 *       - Song
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         description: ID của bài hát cần truy vấn
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Trả về thông tin bài hát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 title:
 *                   type: string
 *                   example: Buổi sáng bình yên
 *                 artist:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Mỹ Tâm
 *                 url:
 *                   type: string
 *                   example: http://example.com/song.mp3
 *                 imageUrl:
 *                   type: string
 *                   example: http://example.com/song.jpg
 *                 duration:
 *                   type: integer
 *                   description: Thời lượng bài hát (giây)
 *                   example: 210
 *                 message:
 *                   type: string
 *                   example: Song fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: | 
 *           ID bài hát không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid song ID provided.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: |
 *           Không tìm thấy bài hát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song not found.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const getSongByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const songId = parseInt(req.params.songId, 10);
    if (isNaN(songId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid song ID provided.");
    }
    const song = await getSongByIdService(songId);
    res.status(StatusCodes.OK).json({ ...song, message: "Song fetched successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Lấy danh sách tất cả các bài hát hoặc tìm kiếm bài hát
 *     description: | 
 *       Trả về danh sách bài hát có thể lọc theo từ khóa tìm kiếm. Hỗ trợ phân trang.
 *     tags:
 *       - Song
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo tên bài hát hoặc nghệ sĩ
 *         example: Mặt trời
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại (pagination)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng bài hát trên mỗi trang
 *         example: 10
 *     responses:
 *       200:
 *         description: |
 *           Danh sách bài hát được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 songs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       title:
 *                         type: string
 *                         example: Em của ngày hôm qua
 *                       artist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: Sơn Tùng M-TP
 *                       duration:
 *                         type: integer
 *                         example: 240
 *                 message:
 *                   type: string
 *                   example: Songs fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: |
 *           Tham số truy vấn không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query parameters.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const getSongsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyword = (req.query.q as string)?.trim();
    const { page, limit } = parsePaginationParams(req.query);

    const songs = await getSongsService({ keyword, page, limit });

    res.status(StatusCodes.OK).json({ ...songs, message: "Songs fetched successfully." });
  } catch (error) {
    console.error("Error in getOrSearchSongsController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/favorites:
 *   post:
 *     summary: Thêm bài hát vào danh sách yêu thích của user
 *     tags:
 *       - Favorite
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               songId:
 *                 type: integer
 *                 example: 123
 *             required:
 *               - songId
 *     responses:
 *       200:
 *         description: |
 *           Bài hát đã được thêm vào danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songId:
 *                   type: integer
 *                   example: 123
 *                 message:
 *                   type: string
 *                   example: Song added to favorites successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: |
 *           Yêu cầu không hợp lệ (ví dụ: songId không hợp lệ).
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: |
 *           Không được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       404:
 *         description: |
 *           Không tìm thấy bài hát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song not found.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       409:
 *         description: |
 *           Bài hát đã tồn tại trong danh sách yêu thích.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song already in favorites.
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const addFavoriteSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { songId } = req.body;
    const userId = res.locals.user.id;

    if (!songId || isNaN(songId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid song ID.");
    }
    if (!userId) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "User not authenticated.");
    }

    const result = await addFavoriteSongService(userId, songId);
    res.status(StatusCodes.OK).json({ songId: result.songId, message: "Song added to favorites successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/favorites/{songId}:
 *   delete:
 *     summary: Xóa bài hát khỏi danh sách yêu thích của user
 *     tags:
 *       - Favorite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         description: ID của bài hát cần xóa khỏi danh sách yêu thích.
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: |
 *           Bài hát đã được xóa khỏi danh sách yêu thích.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 songId:
 *                   type: integer
 *                   example: 123
 *                 message:
 *                   type: string
 *                   example: Removed from favorites.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: |
 *           Yêu cầu không hợp lệ (ví dụ: songId không hợp lệ).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid song ID.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: |
 *           Không được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       404:
 *         description: |
 *           Bài hát không có trong danh sách yêu thích.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song is not in favorite list.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const deleteFavoriteSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const songId = parseInt(req.params.songId, 10);
    const userId = res.locals.user.id;

    if (isNaN(songId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid song ID.");
    }
    if (!userId) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "User not authenticated.");
    }

    const result = await deleteFavoriteSongService(userId, songId);
    res.status(StatusCodes.OK).json({ songId: result.songId, message: "Removed from favorites successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/favorites:
 *   get:
 *     summary: Lấy danh sách bài hát yêu thích của người dùng
 *     description: | 
 *       Trả về danh sách các bài hát mà người dùng đã đánh dấu là yêu thích. Hỗ trợ phân trang.
 *     tags:
 *       - Favorite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại (pagination)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng bài hát trên mỗi trang
 *         example: 10
 *     responses:
 *       200:
 *         description: | 
 *           Danh sách bài hát yêu thích được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 favoriteSongs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Bài hát yêu thích 1
 *                       artist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           name:
 *                             type: string
 *                             example: Nghệ sĩ A
 *                       duration:
 *                         type: integer
 *                         example: 180
 *                 message:
 *                   type: string
 *                   example: Favorite songs fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: |
 *           Không được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const getFavoriteSongsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const { page, limit } = parsePaginationParams(req.query);

    if (!userId) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "User not authenticated.");
    }

    const favoriteSongs = await getFavoriteSongsService({ userId, page, limit });

    res.status(StatusCodes.OK).json({ ...favoriteSongs, message: "Favorite songs fetched successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/history:
 *   get:
 *     summary: Lấy lịch sử phát nhạc của người dùng
 *     description: | 
 *       Trả về danh sách các bài hát đã được người dùng phát gần đây. Hỗ trợ phân trang.
 *     tags:
 *       - Playback History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại (pagination)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng bài hát trên mỗi trang
 *         example: 10
 *     responses:
 *       200:
 *         description: | 
 *           Lịch sử phát nhạc được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 historyItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       playedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-07-20T10:00:00Z
 *                       song:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           title:
 *                             type: string
 *                             example: Bài hát trong lịch sử
 *                           artist:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 20
 *                               name:
 *                                 type: string
 *                                 example: Nghệ sĩ X
 *                               duration:
 *                                 type: integer
 *                                 example: 200
 *                 message:
 *                   type: string
 *                   example: Playback history fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: |
 *           Không được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const getPlaybackHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const { page, limit } = parsePaginationParams(req.query);

    if (!userId) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "User not authenticated.");
    }

    const history = await getPlaybackHistoryService({ userId, page, limit });

    res.status(StatusCodes.OK).json({ ...history, message: "Playback history fetched successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/{songId}/play:
 *   post:
 *     summary: Ghi nhận lượt phát bài hát
 *     description: Ghi lại rằng người dùng đã phát một bài hát cụ thể. API này sẽ thêm bài hát vào lịch sử phát nhạc của người dùng và tăng số lượt nghe của bài hát đó.
 *     tags:
 *       - Playback History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         description: ID của bài hát đã được phát.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: |
 *           Lượt phát bài hát đã được ghi nhận thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playback recorded successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: |
 *           ID bài hát không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid song ID.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: |
 *           Không được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       404:
 *         description: |
 *           Không tìm thấy bài hát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song not found.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: |
 *           Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const playSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const songId = parseInt(req.params.songId, 10);
    const userId = res.locals.user.id;

    if (isNaN(songId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid song ID.");
    }
    if (!userId) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "User not authenticated.");
    }

    await playSongService(userId, songId);

    res.status(StatusCodes.OK).json({ message: "Playback recorded successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/top-listens:
 *   get:
 *     summary: Lấy danh sách bài hát có lượt nghe cao nhất
 *     description: Trả về danh sách các bài hát được nghe nhiều nhất, sắp xếp theo lượt nghe giảm dần. Hỗ trợ phân trang.
 *     tags:
 *       - Song
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại (pagination)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng bài hát trên mỗi trang
 *         example: 10
 *     responses:
 *       200:
 *         description: Danh sách bài hát top được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 20
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 topSongs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       title:
 *                         type: string
 *                         example: Bài hát hot
 *                       artist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 100
 *                           name:
 *                             type: string
 *                             example: Nghệ sĩ Hot
 *                       listens:
 *                         type: integer
 *                         example: 5000
 *                 message:
 *                   type: string
 *                   example: Top songs fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Tham số truy vấn không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid query parameters.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const getTopSongsByListensController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = parsePaginationParams(req.query);

    const topSongs = await getTopSongsByListensService({ page, limit });

    res.status(StatusCodes.OK).json({ ...topSongs, message: "Top songs fetched successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/songs/genres/{genreName}/top-listens:
 *   get:
 *     summary: Lấy danh sách bài hát có lượt nghe cao nhất theo thể loại
 *     description: Trả về danh sách các bài hát được nghe nhiều nhất trong một thể loại cụ thể, sắp xếp theo lượt nghe giảm dần. Hỗ trợ phân trang.
 *     tags:
 *       - Song
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: genreName
 *         required: true
 *         description: 'Tên thể loại (ví dụ: VN, US-UK, K-POP)'
 *         schema:
 *           type: string
 *           example: VN
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại (pagination)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng bài hát trên mỗi trang
 *         example: 10
 *     responses:
 *       200:
 *         description: Danh sách bài hát top theo thể loại được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 20
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 topSongs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       title:
 *                         type: string
 *                         example: Bài hát hot theo thể loại
 *                       artist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 100
 *                           name:
 *                             type: string
 *                             example: Nghệ sĩ A
 *                       listenCount:
 *                         type: integer
 *                         example: 500
 *                 message:
 *                   type: string
 *                   example: Top songs by genre fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Tham số truy vấn hoặc tên thể loại không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid genre name or query parameters.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: Không tìm thấy thể loại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Genre not found.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const getTopSongsByGenreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const genreName = req.params.genreName as string;
    const { page, limit } = parsePaginationParams(req.query);

    // Validate genreName against allowed genres (VN, US-UK, K-POP)
    const allowedGenres = ['VN', 'US-UK', 'K-POP'];
    if (!genreName || !allowedGenres.includes(genreName.toUpperCase())) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid genre name. Allowed genres are VN, US-UK, K-POP.");
    }

    const topSongs = await getTopSongsByGenreService({
      genre: genreName.toUpperCase(),
      page,
      limit,
    });

    res.status(StatusCodes.OK).json({ ...topSongs, message: `Top songs in ${genreName} fetched successfully.` });
  } catch (error) {
    next(error);
  }
};

export {
  getSongByIdController,
  getSongsController,
  addFavoriteSongController,
  deleteFavoriteSongController,
  getFavoriteSongsController,
  getPlaybackHistoryController,
  playSongController,
  getTopSongsByListensController,
  getTopSongsByGenreController,
};
