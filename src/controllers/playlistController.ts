import { Request, Response, NextFunction } from "express";
import {
  addSongToPlaylistService,
  createPlaylistService,
  deletePlaylistService,
  deleteSongToPlaylistService,
  getPlaylistsService,
  getSongsPlaylistService,
  updatePlaylistNameService,
} from "../services/playlistService";
import { StatusCodes } from "http-status-codes";
import { parsePaginationParams } from "../utils/pagination";

/**
 * @swagger
 * /api/playlist:
 *   post:
 *     summary: Tạo playlist mới
 *     description: Cho phép người dùng đã đăng nhập tạo một playlist mới.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []  # Yêu cầu JWT để xác thực người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Playlist Test 1
 *     responses:
 *       201:
 *         description: Playlist được tạo thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Playlist Test 1
 *                 userId:
 *                   type: integer
 *                   example: 42
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T15:23:01.123Z"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ, chẳng hạn thiếu tên playlist hoặc sai kiểu dữ liệu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist name is required
 *       401:
 *         description: Người dùng chưa được xác thực hoặc token không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Lỗi máy chủ khi tạo playlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */

const createPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    // Giả định middleware xác thực đã chạy và gán user vào res.locals
    const userId = res.locals.user.id; // Lấy userId từ thông tin người dùng đã xác thực
    if (!name || typeof name !== "string") {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Playlist name is required" });
      return;
    }

    const newPlaylist = await createPlaylistService(name, userId);
    res.status(StatusCodes.CREATED).json(newPlaylist);
  } catch (error) {
    console.error("Error in createPlaylistController:", error);
    next(error); // Chuyển lỗi đến middleware xử lý lỗi tập trung nếu có
  }
};

/**
 * @swagger
 * /api/playlist/{playlistId}:
 *   put:
 *     summary: Cập nhật tên playlist
 *     description: Cập nhật tên playlist của người dùng hiện tại theo ID. Chỉ chủ sở hữu của playlist mới được phép cập nhật.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         description: ID của playlist cần cập nhật
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Playlist Chill Cuối Tuần - Update
 *     responses:
 *       200:
 *         description: Cập nhật tên playlist thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Playlist Chill Cuối Tuần - Update
 *                 userId:
 *                   type: integer
 *                   example: 42
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T15:23:01.123Z"
 *       400:
 *         description: Yêu cầu không hợp lệ – thiếu tên mới hoặc ID playlist không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid playlist ID
 *       401:
 *         description: Người dùng chưa được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found
 *       500:
 *         description: Lỗi máy chủ nội bộ khi cập nhật playlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */

const updatePlaylistNameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10); // Lấy ID từ URL params
    const { name: newName } = req.body; // Lấy tên mới từ body
    const userId = res.locals.user.id;
    if (isNaN(playlistId)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid playlist ID" });
      return;
    }

    if (!newName) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "New playlist name is required" });
      return;
    }

    const updatedPlaylist = await updatePlaylistNameService(
      playlistId,
      newName,
      userId
    );

    if (!updatedPlaylist) {
      // Trường hợp service trả về null (không tìm thấy playlist)
      res.status(StatusCodes.NOT_FOUND).json({ message: "Playlist not found" });
      return;
    }

    res.status(StatusCodes.OK).json(updatedPlaylist);
  } catch (error) {
    // Sử dụng 'any' tạm thời hoặc định nghĩa kiểu lỗi cụ thể
    console.error("Error in updatePlaylistNameController:", error);
    next(error); // Chuyển lỗi khác đến middleware xử lý lỗi tập trung
  }
};

/**
 * @swagger
 * /api/playlist/{playlistId}:
 *   delete:
 *     summary: Xoá playlist
 *     description: |
 *       Xoá một playlist dựa trên ID nếu playlist thuộc về người dùng hiện tại.
 *       Yêu cầu xác thực bằng JWT token.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         description: ID của playlist cần xoá
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Playlist đã được xoá thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Playlist Test 1 Modified
 *                 userId:
 *                   type: integer
 *                   example: 42
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T15:23:01.123Z"
 *       400:
 *         description: ID playlist không hợp lệ (không phải số nguyên hợp lệ).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid playlist ID
 *       401:
 *         description: Không được xác thực hoặc thiếu token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Playlist không tồn tại hoặc không thuộc quyền sở hữu của người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found
 *       500:
 *         description: Lỗi máy chủ nội bộ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

const deletePlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10); // Lấy ID từ URL params
    const userId = res.locals.user.id;
    if (isNaN(playlistId)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid playlist ID" });
      return;
    }

    const deletePlaylist = await deletePlaylistService(playlistId, userId);

    if (!deletePlaylist) {
      // Trường hợp service trả về null (không tìm thấy playlist)
      res.status(StatusCodes.NOT_FOUND).json({ message: "Playlist not found" });
      return;
    }

    res.status(StatusCodes.OK).json(deletePlaylist);
  } catch (error) {
    // Sử dụng 'any' tạm thời hoặc định nghĩa kiểu lỗi cụ thể
    console.error("Error in deletePlaylistController:", error);
    next(error); // Chuyển lỗi khác đến middleware xử lý lỗi tập trung
  }
};

/**
 * @swagger
 * /api/playlist/{playlistId}:
 *   post:
 *     summary: Thêm bài hát vào playlist
 *     description: |
 *       Thêm một bài hát cụ thể vào playlist dựa trên ID playlist và ID bài hát.
 *       Chỉ cho phép nếu playlist thuộc quyền sở hữu của người dùng hiện tại.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         description: ID của playlist muốn thêm bài hát vào
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songId
 *             properties:
 *               songId:
 *                 type: integer
 *                 description: ID của bài hát cần thêm vào playlist
 *                 example: 42
 *     responses:
 *       201:
 *         description: Bài hát đã được thêm vào playlist thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song added to playlist
 *                 data:
 *                   type: object
 *                   properties:
 *                     playlistId:
 *                       type: integer
 *                       example: 1
 *                     songId:
 *                       type: integer
 *                       example: 42
 *                     addedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-10T15:50:12.000Z"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc bài hát đã tồn tại trong playlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song already in playlist
 *       401:
 *         description: Không được xác thực.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found or unauthorized
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

const addSongToPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { playlistId } = req.params;
  const { songId } = req.body;
  const userId = res.locals.user.id;
  try {
    const added = await addSongToPlaylistService(
      Number(playlistId),
      Number(songId),
      userId
    );
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Song added to playlist", data: added });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/playlist/delete/{playlistId}:
 *   delete:
 *     summary: Xóa bài hát khỏi playlist của người dùng
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của playlist cần xóa bài hát
 *     requestBody:
 *       description: ID của bài hát cần xóa khỏi playlist
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songId
 *             properties:
 *               songId:
 *                 type: integer
 *                 example: 42
 *     responses:
 *       200:
 *         description: Xóa bài hát khỏi playlist thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song deleted from playlist
 *                 data:
 *                   type: object
 *                   properties:
 *                     playlistId:
 *                       type: integer
 *                       example: 4
 *                     songId:
 *                       type: integer
 *                       example: 11
 *                     addedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-10T03:13:59.499Z"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được xác thực
 *       403:
 *         description: Không có quyền thao tác
 *       404:
 *         description: Không tìm thấy playlist hoặc bài hát trong playlist
 *       500:
 *         description: Lỗi máy chủ nội bộ
 */

const deleteSongToPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { playlistId } = req.params;
  const { songId } = req.body;
  const userId = res.locals.user.id;
  try {
    const deleted = await deleteSongToPlaylistService(
      Number(playlistId),
      Number(songId),
      userId
    );
    res
      .status(StatusCodes.OK)
      .json({ message: "Song deleted from playlist", data: deleted });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/playlist/{id}:
 *   get:
 *     summary: Lấy danh sách playlist của người dùng
 *     description: |
 *       Trả về tất cả playlist thuộc về một người dùng xác thực.
 *       Chỉ cho phép truy cập nếu `id` khớp với người dùng hiện tại.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách playlist của người dùng
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
 *                         example: 4
 *                       name:
 *                         type: string
 *                         example: "meo meo"
 *       400:
 *         description: ID người dùng không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *       401:
 *         description: Không được xác thực
 *       403:
 *         description: Không có quyền truy cập (user ID không khớp)
 *       500:
 *         description: Lỗi máy chủ nội bộ
 */

const getPlaylistsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const authenticateUserId = res.locals.user.id;
    if (isNaN(userId)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid user ID" });
      return;
    }

    if (userId !== authenticateUserId) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden: Access denied" });
      return;
    }

    const playlists = await getPlaylistsService(userId);

    res.status(StatusCodes.OK).json({ data: playlists });
  } catch (error) {
    console.error("Error in getUserPlaylistsController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlist/songs/{playlistId}:
 *   get:
 *     summary: Lấy danh sách bài hát của playlist
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của playlist
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bài hát mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bài hát trong playlist
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
 *                       playlistId:
 *                         type: integer
 *                         example: 4
 *                       songId:
 *                         type: integer
 *                         example: 13
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-10T03:49:26.522Z"
 *                       song:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 13
 *                           title:
 *                             type: string
 *                             example: "Dự Báo Thời Tiết Hôm Nay Mưa"
 *                           titleNormalized:
 *                             type: string
 *                             example: "du bao thoi tiet hom nay mua"
 *                           duration:
 *                             type: integer
 *                             example: 240
 *                           url:
 *                             type: string
 *                             format: uri
 *                             example: "https://gnid31-bucket.s3.amazonaws.com/mp3/13_Dự báo thời tiết hôm nay mưa.mp3"
 *                           imageUrl:
 *                             type: string
 *                             format: uri
 *                             example: "https://example.com/images/songs/uocgi.jpg"
 *                           artistId:
 *                             type: integer
 *                             example: 3
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-06-09T15:33:12.305Z"
 *                           artist:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 3
 *                               name:
 *                                 type: string
 *                                 example: "Grey D"
 *                               nameNormalized:
 *                                 type: string
 *                                 example: "grey d"
 *                               imageUrl:
 *                                 type: string
 *                                 format: uri
 *                                 example: "https://example.com/images/artists/SonTungMTP.jpg"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-06-09T15:30:04.396Z"
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 */

const getSongsPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = parsePaginationParams(req.query);
    const playlistId = parseInt(req.params.playlistId as string, 10);
    const userId = res.locals.user?.id;

    if (isNaN(playlistId)) {
      res.status(400).json({ message: "Invalid playlist ID" });
      return;
    }

    const songs = await getSongsPlaylistService({
      playlistId,
      userId,
      page,
      limit,
    });

    // Trả về kết quả
    res.status(StatusCodes.OK).json(songs);
  } catch (error) {
    console.error("Error in getSongsPlaylistController:", error);
    // Chuyển lỗi xuống middleware xử lý lỗi nếu có
    next(error);
    // Hoặc trả về lỗi trực tiếp nếu không dùng middleware xử lý lỗi:
    // res.status(500).json({ message: "Internal server error", error: (error as Error).message }ke);
  }
};

export {
  createPlaylistController,
  updatePlaylistNameController,
  deletePlaylistController,
  addSongToPlaylistController,
  deleteSongToPlaylistController,
  getPlaylistsController,
  getSongsPlaylistController,
};
