import { StatusCodes } from "http-status-codes"; // Import StatusCodes
import {
  registerNewUser,
  loginUserService,
  logoutUserService,
} from "../services/authService";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../middlewares/errorHandler";
import { IAuthUserBody } from "../dto/auth.dto";

const registerUser = async (
  req: Request<{}, {}, IAuthUserBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, username, password } = req.body;

    // Password hashing and user creation logic moved to authService
    await registerNewUser(name, username, password);
  } catch (error) {
    console.error("Register error:", error);
    next(error); // Pass error to middleware
  }

  res.status(StatusCodes.CREATED).send("User registered successfully.");
};

// Controller function to handle user login requests
const loginUser = async (
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

const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
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
export { registerUser, loginUser, logoutUser };
