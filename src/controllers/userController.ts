import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getProfileService } from "../services/userService";

/**
 * @swagger
 * /api/user:
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
 *       401:
 *         description: Không có hoặc token không hợp lệ.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */

const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = res.locals.user.id;
    const profile = await getProfileService(id);
    res.status(StatusCodes.OK).send(profile);
  } catch (error) {
    next(error);
  }
};

export { getProfileController };
