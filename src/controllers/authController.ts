import { StatusCodes } from "http-status-codes"; // Import StatusCodes
import {
  loginUserService,
  logoutUserService,
  registerUserService,
} from "../services/authService";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../middlewares/errorHandler";
import { IAuthUserBody } from "../dto/auth.dto";

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
 *                 example: Nguyễn Văn A
 *               username:
 *                 type: string
 *                 example: nguyenvana
 *               password:
 *                 type: string
 *                 format: password
 *                 example: matkhau123
 *               repeatpassword:
 *                 type: string
 *                 format: password
 *                 example: matkhau123
 *     responses:
 *       201:
 *         description: Người dùng được đăng ký thành công.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User registered successfully.
 *       400:
 *         description: Yêu cầu không hợp lệ.
 *       409:
 *         description: Tên đăng nhập đã tồn tại.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
const registerUserController = async (
  req: Request<{}, {}, IAuthUserBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, username, password } = req.body;

    // Password hashing and user creation logic moved to authService
    await registerUserService(name, username, password);
  } catch (error) {
    console.error("Register error:", error);
    next(error); // Pass error to middleware
  }

  res.status(StatusCodes.CREATED).send("User registered successfully.");
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
 *                 example: test
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
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */

// Controller function to handle user login requests
const loginUserController = async (
  req: Request<{}, {}, IAuthUserBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    // Call the loginUser service function
    const token = await loginUserService(username, password);

    // If login is successful, send the token in the response
    res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    // If an error occurs (e.g., Invalid credentials), pass it to the error handling middleware
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất người dùng
 *     description: Đăng xuất người dùng hiện tại bằng cách vô hiệu hóa JWT token hiện tại.
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
 *                   example: Đăng xuất thành công.
 *       401:
 *         description: Token không hợp lệ hoặc không được cung cấp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No token provided
 *       400:
 *         description: Yêu cầu đăng xuất không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token đã bị vô hiệu hóa.
 *       500:
 *         description: Lỗi máy chủ nội bộ khi xử lý đăng xuất.
 */

const logoutUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Hàm điều khiển (Controller) xử lý yêu cầu đăng xuất người dùng
  try {
    // Trích xuất tiêu đề (header) 'Authorization' từ yêu cầu
    const authHeader = req.headers["authorization"];
    // Tách chuỗi tiêu đề để lấy token (giả định định dạng "Bearer token")
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      throw new CustomError("No token provided", StatusCodes.UNAUTHORIZED);
    }
    //const decoded = jwt.decode(token) as jwt.JwtPayload;

    // Gọi hàm dịch vụ (service) để xử lý logic đăng xuất cốt lõi (như thêm token vào danh sách đen - blacklist)
    const result = await logoutUserService(token, res.locals.user);

    // Kiểm tra kết quả trả về từ hàm dịch vụ
    if (result.success) {
      // Nếu đăng xuất thành công, gửi phản hồi 200 OK
      res.status(StatusCodes.OK).json({ message: result.message }); // Sử dụng StatusCodes.OK cho thành công
    } else {
      // Nếu đăng xuất thất bại, xử lý các trường hợp lỗi khác nhau
      // Kiểm tra xem thông báo lỗi có phải là "No token provided" không
      res
        .status(
          result.message === "No token provided"
            ? StatusCodes.UNAUTHORIZED
            : StatusCodes.BAD_REQUEST
        )
        .json({ message: result.message }); // Sử dụng 401 cho token bị thiếu, 400 cho các yêu cầu sai khác
    }
  } catch (error) {
    // Nếu có bất kỳ lỗi không mong muốn nào xảy ra trong quá trình xử lý
    console.error("Logout error:", error); // Ghi log lỗi để gỡ lỗi
    next(error); // Chuyển lỗi đến middleware xử lý lỗi tiếp theo
  }
};

// ... export hàm logoutUser để sử dụng trong router của bạn
// router.post('/logout', logoutUser);

// Export both controllers
export { registerUserController, loginUserController, logoutUserController };
