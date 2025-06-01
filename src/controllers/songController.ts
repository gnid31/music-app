import { Request, Response, NextFunction } from "express";
import { getSongsService, getSongByIdService } from "../services/songService";
import { StatusCodes } from "http-status-codes";
import { parsePaginationParams } from "../utils/pagination";

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
    res.status(200).json(songs);
  } catch (error) {
    console.error("Error in getOrSearchSongsController:", error);
    // Chuyển lỗi xuống middleware xử lý lỗi nếu có
    next(error);
    // Hoặc trả về lỗi trực tiếp nếu không dùng middleware xử lý lỗi:
    // res.status(500).json({ message: "Internal server error", error: (error as Error).message }ke);
  }
};

export { getSongByIdController, getSongsController };
