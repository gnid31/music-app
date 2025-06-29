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
import { CustomError } from "../utils/customError";

/**
 * @swagger
 * /api/playlists:
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
 *                 message:
 *                   type: string
 *                   example: Playlist created successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 201
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
 *                 statusCode:
 *                   type: integer
 *                   example: 400
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
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       409:
 *         description: Tên playlist đã tồn tại cho người dùng này.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist with this name already exists for this user.
 *                 statusCode:
 *                   type: integer
 *                   example: 409
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
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const createPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const userId = res.locals.user.id;
    if (!name || typeof name !== "string") {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Playlist name is required");
    }

    const newPlaylist = await createPlaylistService(name, userId);
    res.status(StatusCodes.CREATED).json({ ...newPlaylist, message: "Playlist created successfully." });
  } catch (error) {
    console.error("Error in createPlaylistController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlists/{playlistId}:
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
 *                 message:
 *                   type: string
 *                   example: Playlist name updated successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
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
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Người dùng chưa được xác thực.
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
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found or not owned by user.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       409:
 *         description: Tên playlist đã tồn tại cho người dùng này.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist with this name already exists for this user.
 *                 statusCode:
 *                   type: integer
 *                   example: 409
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
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

const updatePlaylistNameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10);
    const { name: newName } = req.body;
    const userId = res.locals.user.id;
    if (isNaN(playlistId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid playlist ID");
    }

    if (!newName) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "New playlist name is required");
    }

    const updatedPlaylist = await updatePlaylistNameService(
      playlistId,
      newName,
      userId
    );
    res.status(StatusCodes.OK).json({ ...updatedPlaylist, message: "Playlist name updated successfully." });
  } catch (error) {
    console.error("Error in updatePlaylistNameController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlists/{playlistId}:
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
 *         description: Playlist được xoá thành công.
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
 *                 message:
 *                   type: string
 *                   example: Playlist deleted successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: ID playlist không hợp lệ (không phải số nguyên hợp lệ).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid playlist ID.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Người dùng chưa được xác thực.
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
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found or not owned by user.
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

const deletePlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playlistId } = req.params;
    console.log(`Received playlistId: '${playlistId}'`);
    const userId = res.locals.user.id;

    if (isNaN(Number(playlistId))) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid playlist ID");
    }

    const deletedPlaylist = await deletePlaylistService(
      Number(playlistId),
      userId
    );
    res.status(StatusCodes.OK).json({ ...deletedPlaylist, message: "Playlist deleted successfully." });
  } catch (error) {
    console.error("Error in deletePlaylistController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlists/{playlistId}/songs:
 *   post:
 *     summary: Thêm bài hát vào playlist
 *     description: Thêm một bài hát vào playlist của người dùng hiện tại.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         description: ID của playlist để thêm bài hát vào
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
 *                 example: 123
 *     responses:
 *       200:
 *         description: Bài hát đã được thêm vào playlist thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 playlistId:
 *                   type: integer
 *                   example: 1
 *                 songId:
 *                   type: integer
 *                   example: 123
 *                 addedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T15:50:12.000Z"
 *                 message:
 *                   type: string
 *                   example: Song added to playlist successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc bài hát đã tồn tại trong playlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid playlist ID or song ID.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Người dùng chưa được xác thực.
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
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found or unauthorized.
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       409:
 *         description: Bài hát đã tồn tại trong playlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song already in playlist.
 *                 statusCode:
 *                   type: integer
 *                   example: 409
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

const addSongToPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10);
    const { songId } = req.body;
    const userId = res.locals.user.id;

    if (isNaN(playlistId) || !songId || isNaN(songId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid playlist ID or song ID.");
    }

    const addedSong = await addSongToPlaylistService(
      playlistId,
      songId,
      userId
    );

    res.status(StatusCodes.OK).json({ ...addedSong, message: "Song added to playlist successfully." });
  } catch (error) {
    console.error("Error in addSongToPlaylistController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlists/{playlistId}/songs/{songId}:
 *   delete:
 *     summary: Xoá bài hát khỏi playlist
 *     description: Xoá một bài hát khỏi playlist của người dùng hiện tại.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         description: ID của playlist
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: songId
 *         required: true
 *         description: ID của bài hát cần xóa
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Bài hát đã được xóa khỏi playlist thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 playlistId:
 *                   type: integer
 *                   example: 1
 *                 songId:
 *                   type: integer
 *                   example: 123
 *                 addedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T15:50:12.000Z"
 *                 message:
 *                   type: string
 *                   example: Song removed from playlist successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid playlist ID or song ID.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Người dùng chưa được xác thực.
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
 *         description: Bài hát không có trong playlist hoặc playlist không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song doesn\'t exist in playlist.
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

const deleteSongToPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10);
    const songId = parseInt(req.params.songId, 10);
    const userId = res.locals.user.id;

    if (isNaN(playlistId) || isNaN(songId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid playlist ID or song ID.");
    }
    if (!userId) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "User not authenticated.");
    }

    const deletedSong = await deleteSongToPlaylistService(
      playlistId,
      songId,
      userId
    );
    res.status(StatusCodes.OK).json({ ...deletedSong, message: "Song removed from playlist successfully." });
  } catch (error) {
    console.error("Error in deleteSongToPlaylistController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlists:
 *   get:
 *     summary: Lấy danh sách tất cả các playlist của người dùng
 *     description: Trả về danh sách tất cả các playlist thuộc về người dùng đang đăng nhập.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách playlist được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlists fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 playlists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: My Playlist 1
 *                       userId:
 *                         type: integer
 *                         example: 42
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-10T15:23:01.123Z"
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
 *                 statusCode:
 *                   type: integer
 *                   example: 401
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

const getPlaylistsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const playlists = await getPlaylistsService(userId);
    res.status(StatusCodes.OK).json({ playlists, message: "Playlists fetched successfully." });
  } catch (error) {
    console.error("Error in getPlaylistsController:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/playlists/{playlistId}/songs:
 *   get:
 *     summary: Lấy danh sách các bài hát trong playlist
 *     description: Trả về danh sách các bài hát trong một playlist cụ thể của người dùng.
 *     tags:
 *       - Playlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         description: ID của playlist để lấy bài hát
 *         schema:
 *           type: integer
 *           example: 1
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
 *         description: Danh sách bài hát trong playlist được trả về thành công.
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
 *                 playlistSongs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Song in Playlist
 *                       artist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           name:
 *                             type: string
 *                             example: Artist Z
 *                       duration:
 *                         type: integer
 *                         example: 200
 *                 message:
 *                   type: string
 *                   example: Songs in playlist fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid playlist ID.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Người dùng chưa được xác thực.
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
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist not found or unauthorized.
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

const getSongsPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10);
    const userId = res.locals.user.id;
    const { page, limit } = parsePaginationParams(req.query);

    if (isNaN(playlistId)) {
      throw new CustomError(StatusCodes.BAD_REQUEST, "Invalid playlist ID.");
    }

    const songsInPlaylist = await getSongsPlaylistService({
      playlistId,
      userId,
      page,
      limit,
    });

    res.status(StatusCodes.OK).json({ ...songsInPlaylist, message: "Songs in playlist fetched successfully." });
  } catch (error) {
    console.error("Error in getSongsPlaylistController:", error);
    next(error);
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
