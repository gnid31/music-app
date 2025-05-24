// src/controllers/playlistController.ts
import { Request, Response, NextFunction } from "express";
import {
  createPlaylistService,
  updatePlaylistNameService,
} from "../services/playlistService";
import { StatusCodes } from "http-status-codes";

const createPlaylistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("BODY:", req.body);

    const { name } = req.body;
    console.log("----------------------------");
    // Giả định middleware xác thực đã chạy và gán user vào res.locals
    const userId = res.locals.user.id; // Lấy userId từ thông tin người dùng đã xác thực

    const newPlaylist = await createPlaylistService(name, userId);
    res.status(StatusCodes.CREATED).json(newPlaylist);
  } catch (error) {
    console.error("Error in createPlaylistController:", error);
    next(error); // Chuyển lỗi đến middleware xử lý lỗi tập trung nếu có
  }
};

const updatePlaylistNameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playlistId = parseInt(req.params.id, 10); // Lấy ID từ URL params
    const { name: newName } = req.body; // Lấy tên mới từ body

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
      newName
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

export { createPlaylistController, updatePlaylistNameController };
