import jwt from "jsonwebtoken"; // Import jwt đầy đủ
import redisClient from "../config/redisClient"; // Import client Redis đã kết nối đúng cách
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/customError"; // Import CustomError

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Đổi sang async function
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new CustomError(StatusCodes.UNAUTHORIZED, "No token provided."));
  }

  // *** Bước quan trọng: Kiểm tra token trong Redis blacklist ***
  const redisKey = `blacklist:${token}`;
  try {
    const reply = await redisClient.get(redisKey); // Sử dụng await với redisClient.get

    if (reply) {
      // Nếu token tồn tại trong Redis (blacklist)
      console.log(`Blacklisted token access attempt: ${token}`);
      return next(new CustomError(StatusCodes.UNAUTHORIZED, "Token has been revoked.")); // Trả về lỗi 401 hoặc 403
    }

    // Nếu token KHÔNG có trong Redis blacklist, tiến hành xác minh token
    const jwtSecret =
      process.env.JWT_SECRET || "642be298-b982-4517-9d0d-bedd6acecdd4";
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        console.log(err);

        // Lỗi xác minh (ví dụ: token hết hạn, chữ ký sai)
        return next(new CustomError(StatusCodes.UNAUTHORIZED, "Invalid or expired token."));
      }
      // Xác minh thành công, lưu thông tin user vào respone và chuyển tiếp
      res.locals.user = user;
      next();
    });
  } catch (err) {
    console.error("Redis check error or JWT verification error:", err);
    // Xử lý lỗi, có thể trả về 500
    return next(new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Authentication failed due to an unexpected error."));
  }
};

export default authenticateToken;
