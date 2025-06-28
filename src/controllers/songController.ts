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
  getTopGenresByListensService,
} from "../services/songService";
import { StatusCodes } from "http-status-codes";
import { parsePaginationParams } from "../utils/pagination";

/**
 * @swagger
 * /api/song/{id}:
 *   get:
 *     summary: Lấy thông tin bài hát theo ID
 *     description: Trả về thông tin chi tiết của bài hát dựa trên ID.
 *     tags:
 *       - Song
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                   type: string
 *                   example: Mỹ Tâm
 *                 album:
 *                   type: string
 *                   example: Những giai điệu tuyệt vời
 *                 duration:
 *                   type: integer
 *                   description: Thời lượng bài hát (giây)
 *                   example: 210
 *       400:
 *         description: ID bài hát không hợp lệ.
 *       404:
 *         description: Không tìm thấy bài hát.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */

const getSongByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const song = await getSongByIdService(id);
    res.status(StatusCodes.OK).send(song);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/song:
 *   get:
 *     summary: Lấy danh sách tất cả các bài hát hoặc tìm kiếm bài hát
 *     description: Trả về danh sách bài hát có thể lọc theo từ khóa tìm kiếm. Hỗ trợ phân trang.
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
 *         description: Danh sách bài hát được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
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
 *                         type: string
 *                         example: Sơn Tùng M-TP
 *                       duration:
 *                         type: integer
 *                         example: 240
 *       400:
 *         description: Tham số truy vấn không hợp lệ.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */

const getSongsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyword = (req.query.q as string)?.trim(); // Lấy từ khóa tìm kiếm từ query 'q'
    const { page, limit } = parsePaginationParams(req.query);

    // Nếu có từ khóa, gọi service tìm kiếm (giới hạn mặc định 10 hoặc theo query param)
    // Nếu không có từ khóa, gọi service lấy tất cả bài hát (có thể giới hạn theo query param)
    const songs = await getSongsService({ keyword, page, limit });

    // Trả về kết quả
    res.status(StatusCodes.OK).json(songs);
  } catch (error) {
    console.error("Error in getOrSearchSongsController:", error);
    // Chuyển lỗi xuống middleware xử lý lỗi nếu có
    next(error);
    // Hoặc trả về lỗi trực tiếp nếu không dùng middleware xử lý lỗi:
    // res.status(500).json({ message: "Internal server error", error: (error as Error).message }ke);
  }
};

/**
 * @swagger
 * /api/song/favorites:
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
 *         description: Bài hát đã được thêm vào danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song added to favorites
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     songId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Bài hát đã có trong danh sách yêu thích
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập hoặc token không hợp lệ)
 *       404:
 *         description: Không tìm thấy bài hát
 *       500:
 *         description: Lỗi máy chủ
 */

// controllers/songController.ts
const addFavoriteSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = res.locals.user.id;
  const { songId } = req.body;

  try {
    const result = await addFavoriteSongService(userId, Number(songId));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/song/favorites:
 *   delete:
 *     summary: Xóa bài hát khỏi danh sách yêu thích của user
 *     tags:
 *       - Favorite
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: ID của bài hát cần xóa khỏi danh sách yêu thích
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
 *         description: Bài hát đã được xóa khỏi danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song removed from favorites
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     songId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Bài hát không tồn tại trong danh sách yêu thích
 *       401:
 *         description: Không có quyền truy cập (chưa đăng nhập hoặc token không hợp lệ)
 *       404:
 *         description: Không tìm thấy bài hát
 *       500:
 *         description: Lỗi máy chủ
 */

const deleteFavoriteSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const { songId } = req.body;
    const result = await deleteFavoriteSongService(userId, Number(songId));
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};
/**
 * @swagger
 * /api/song/favorites:
 *   get:
 *     summary: Lấy danh sách bài hát yêu thích của user
 *     tags:
 *       - Favorite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại để phân trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bài hát trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bài hát yêu thích cùng thông tin phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       title:
 *                         type: string
 *                         example: "Song Title"
 *                       duration:
 *                         type: integer
 *                         example: 240
 *                       url:
 *                         type: string
 *                         example: "http://example.com/song.mp3"
 *                       artist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: "Artist Name"
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized - token không hợp lệ hoặc không có token
 *       500:
 *         description: Lỗi máy chủ
 */

const getFavoriteSongsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(res.locals.user.id);
    const { page, limit } = parsePaginationParams(req.query);

    const favorites = await getFavoriteSongsService({ userId, page, limit });

    res.status(StatusCodes.OK).json(favorites);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/song/history:
 *   get:
 *     summary: Lấy lịch sử phát nhạc của user
 *     tags:
 *       - Playback History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại để phân trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách lịch sử phát nhạc kèm thông tin phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       song:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 123
 *                           title:
 *                             type: string
 *                             example: "Song Title"
 *                           artist:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 10
 *                               name:
 *                                 type: string
 *                                 example: "Artist Name"
 *                           url:
 *                             type: string
 *                             example: "http://example.com/song.mp3"
 *                       playedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-02T10:30:00Z"
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized - token không hợp lệ hoặc không có token
 *       500:
 *         description: Lỗi máy chủ
 */

const getPlaybackHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(res.locals.user.id);
    const { page, limit } = parsePaginationParams(req.query);

    const history = await getPlaybackHistoryService({ userId, page, limit });

    res.status(StatusCodes.OK).json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/song/play/{songId}:
 *   get:
 *     summary: Lấy URL bài hát để phát nhạc
 *     tags:
 *       - Song
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: songId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài hát cần phát
 *     responses:
 *       200:
 *         description: Trả về URL bài hát
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song URL retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: http://example.com/song.mp3
 *       400:
 *         description: ID bài hát không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid song ID
 *       401:
 *         description: Unauthorized - token không hợp lệ hoặc không có token
 *       404:
 *         description: Không tìm thấy bài hát
 *       500:
 *         description: Lỗi máy chủ
 */

const playSongController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const songId = Number(req.params.songId);
    if (isNaN(songId)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid song ID" });
      return;
    }

    const song = await playSongService(userId, songId);

    res.status(StatusCodes.OK).json({
      message: "Song URL retrieved",
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/song/top-listens:
 *   get:
 *     summary: Lấy danh sách 50 bài hát có lượt nghe nhiều nhất
 *     description: Trả về danh sách các bài hát phổ biến nhất dựa trên tổng số lượt nghe.
 *     tags:
 *       - Song Statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Số lượng bài hát hàng đầu cần lấy (mặc định là 50).
 *         example: 50
 *     responses:
 *       200:
 *         description: Danh sách các bài hát hàng đầu được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: Tên Bài Hát
 *                   artist:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Tên Nghệ Sĩ
 *                   listenCount:
 *                     type: integer
 *                     example: 1500
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
const getTopSongsByListensController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = parsePaginationParams(req.query);
    const topSongs = await getTopSongsByListensService({ page, limit });
    res.status(StatusCodes.OK).json(topSongs);
  } catch (error) {
    next(error);
  }
};


/**
 * @swagger
 * /api/song/genre/top-listens:
 *   get:
 *     summary: Lấy danh sách thể loại hoặc top bài hát theo thể loại
 *     description: |
 *       - Nếu không truyền query `genre`, trả về danh sách các thể loại nhạc (mảng chuỗi).
 *       - Nếu truyền query `genre`, trả về danh sách các bài hát được nghe nhiều nhất trong thể loại đó (có phân trang).
 *     tags:
 *       - Song Statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Tên thể loại muốn lấy top bài hát
 *         example: Pop
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại (chỉ áp dụng khi truyền genre)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Số lượng bài hát trên mỗi trang (chỉ áp dụng khi truyền genre)
 *         example: 10
 *     responses:
 *       200:
 *         description: |
 *           - Nếu không truyền genre: trả về mảng các thể loại (array of string).
 *           - Nếu truyền genre: trả về object phân trang các bài hát top của thể loại đó.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     type: string
 *                   description: Danh sách các thể loại nhạc
 *                 - type: object
 *                   properties:
 *                     genre:
 *                       type: string
 *                       example: Pop
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Tên Bài Hát"
 *                           artist:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 2
 *                               name:
 *                                 type: string
 *                                 example: "Tên Nghệ Sĩ"
 *                           listenCount:
 *                             type: integer
 *                             example: 1500
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
const getTopGenresByListensController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = parsePaginationParams(req.query);
    const genre = req.query.genre as string | undefined;
    const topGenres = await getTopGenresByListensService({ genre, page, limit });
    res.status(StatusCodes.OK).json(topGenres);
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
  getTopGenresByListensController
};
