import { StatusCodes } from "http-status-codes"; // Import StatusCodes
import {
  loginUserService,
  logoutUserService,
  registerUserService,
} from "../services/authService";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError"; // Corrected path for CustomError
import { ILoginUserBody, IRegisterUserBody } from "../dto/auth.dto";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     description: Tạo tài khoản mới với tên, tên đăng nhập và mật khẩu.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *               - repeatpassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: User 1
 *               username:
 *                 type: string
 *                 example: test1
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123
 *               repeatpassword:
 *                 type: string
 *                 format: password
 *                 example: 123
 *     responses:
 *       201:
 *         description: Người dùng được đăng ký thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *       400:
 *         description: Yêu cầu không hợp lệ. Có thể thiếu trường hoặc mật khẩu không khớp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Name, username, password, and repeatpassword are required.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       409:
 *         description: Tên đăng nhập đã tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username already exists.
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
const registerUserController = async (
  req: Request<{}, {}, IRegisterUserBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, username, password } = req.body;

    await registerUserService(name, username, password);
    res
      .status(StatusCodes.CREATED)
      .json({
        data: null,
        message: "User registered successfully.",
        statusCode: StatusCodes.CREATED,
      });
  } catch (error) {
    console.error("Register error:", error);
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     description: Xác thực người dùng bằng tên đăng nhập và mật khẩu. Trả về JWT token nếu thành công.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: test1
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJ0ZXN0MiIsImlhdCI6MTc0OTUyMjI1MCwiZXhwIjoxNzQ5NTI1ODUwfQ.KPj-4O7EkgRLFcRuaI0ubnxSa9U_eaIHsvvNjU9XqbQ
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Dữ liệu không hợp lệ. Có thể thiếu tên đăng nhập hoặc mật khẩu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username and password are required.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
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

// Controller function to handle user login requests
const loginUserController = async (
  req: Request<{}, {}, ILoginUserBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    const token = await loginUserService(username, password);

    res
      .status(StatusCodes.OK)
      .json({
        token,
        message: "Login successful.",
        statusCode: StatusCodes.OK,
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất người dùng
 *     description: Đăng xuất người dùng hiện tại bằng cách vô hiệu hóa JWT token hiện tại bằng cách đưa vào danh sách đen (blacklist).
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []  # Yêu cầu xác thực bằng JWT Bearer Token
 *     responses:
 *       200:
 *         description: Đăng xuất thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful.
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Token không hợp lệ hoặc không được cung cấp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No token provided.
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       400:
 *         description: Yêu cầu không hợp lệ, ví dụ như token đã bị vô hiệu hóa trước đó hoặc các lỗi liên quan đến xử lý business logic.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token is already expired.
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       500:
 *         description: Lỗi máy chủ nội bộ khi xử lý đăng xuất.
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

const logoutUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "No token provided.");
    }

    // In a real application, you would ideally extract user info from the token AFTER verification,
    // or simply pass the token to the service for blacklisting without needing user.exp here.
    // Assuming authMiddleware has already attached user info to res.locals for consistency
    const user = res.locals.user;

    const result = await logoutUserService(token, user);

    res
      .status(StatusCodes.OK)
      .json({ message: result.message, statusCode: StatusCodes.OK });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

// ... export hàm logoutUser để sử dụng trong router của bạn
// router.post('/logout', logoutUser);

// Export both controllers
export { registerUserController, loginUserController, logoutUserController };
