import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getProfileService } from "../services/userService";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy thông tin hồ sơ người dùng
 *     description: Trả về thông tin hồ sơ của người dùng đang đăng nhập (yêu cầu xác thực bằng JWT).
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hồ sơ người dùng được lấy thành công.
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
 *                   example: Nguyễn Văn A
 *                 username:
 *                   type: string
 *                   example: nguyenvana
 *                 message:
 *                   type: string
 *                   example: User profile fetched successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Không có hoặc token không hợp lệ.
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

const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = res.locals.user.id;
    const profile = await getProfileService(id);
    res.status(StatusCodes.OK).json({ ...profile, message: "User profile fetched successfully." });
  } catch (error) {
    next(error);
  }
};

export { getProfileController };
