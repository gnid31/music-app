// src/controllers/playlistController.ts
import { Request, Response, NextFunction } from "express";
import {
  addSongToPlaylistService,
  createPlaylistService,
  deletePlaylistService,
  deleteSongToPlaylistService,
  updatePlaylistNameService,
} from "../services/playlistService";
import { StatusCodes } from "http-status-codes";

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
 *                 example: Nhạc chill buổi tối
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
 *                   example: Nhạc chill buổi tối
 *                 userId:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Không được xác thực.
 *       500:
 *         description: Lỗi máy chủ khi tạo playlist.
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
 *     description: Cập nhật tên playlist của người dùng hiện tại theo ID.
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
 *                 example: Playlist buổi sáng
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
 *                   example: Playlist buổi sáng
 *                 userId:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Không được xác thực.
 *       404:
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *       500:
 *         description: Lỗi máy chủ.
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
 *                   example: Playlist buổi sáng
 *                 userId:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: ID playlist không hợp lệ.
 *       401:
 *         description: Không được xác thực.
 *       404:
 *         description: Playlist không tồn tại hoặc không thuộc về người dùng.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */

const deletePlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10); // Lấy ID từ URL params
    const userId = res.locals.user.id;
    console.log("-------------------------------- meo meo", playlistId)
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
    console.error("Error in updatePlaylistNameController:", error);
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
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Không được xác thực.
 *       404:
 *         description: Playlist hoặc bài hát không tồn tại.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
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
    res.status(StatusCodes.CREATED).json({ message: "Song added to playlist", data: added });
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
 *                 example: 123
 *     responses:
 *       201:
 *         description: Xóa bài hát khỏi playlist thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Song deleted to playlist
 *                 data:
 *                   type: object
 *                   description: Dữ liệu bài hát đã xóa (nếu có)
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       401:
 *         description: Unauthorized - token không hợp lệ hoặc không có token
 *       403:
 *         description: Không được phép thao tác (không phải chủ playlist)
 *       404:
 *         description: Không tìm thấy playlist hoặc bài hát trong playlist
 *       500:
 *         description: Lỗi máy chủ
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
    res.status(StatusCodes.CREATED).json({ message: "Song deleted to playlist", data: deleted });
  } catch (error) {
    next(error);
  }
};

export {
  createPlaylistController,
  updatePlaylistNameController,
  deletePlaylistController,
  addSongToPlaylistController,
  deleteSongToPlaylistController
};
