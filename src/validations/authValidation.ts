import Joi from "joi";
import { findUserByUsername } from "../services/authService";
import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { ICheckUsernameBody } from "../dto/auth.dto";
import { CustomError } from "../utils/customError";
// Định nghĩa schema (cấu trúc và ràng buộc) cho dữ liệu đầu vào khi đăng ký
const registrationSchema = Joi.object({
  // Trường username: phải là chuỗi và là trường bắt buộc
  name: Joi.string().required(),
  username: Joi.string().required(),
  // Trường password: phải là chuỗi và là trường bắt buộc
  password: Joi.string().required(),
  // Trường repeatpassword: phải là chuỗi, là trường bắt buộc, và phải có giá trị giống với trường password
  repeatpassword: Joi.string().valid(Joi.ref("password")).required(),
});

// Middleware để xác thực dữ liệu đầu vào cho chức năng đăng ký sử dụng Joi
const validateRegistrationInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Thực hiện validate req.body dựa trên registrationSchema
  const { error } = registrationSchema.validate(req.body, {
    abortEarly: false,
  });

  // Nếu có lỗi trong quá trình validation
  if (error) {
    // Trả về response với mã trạng thái 400 (Bad Request) và thông báo lỗi chi tiết từ Joi
    return next(new CustomError(StatusCodes.BAD_REQUEST, error.message));
  }

  // Nếu dữ liệu hợp lệ, chuyển quyền điều khiển sang middleware/handler tiếp theo
  next();
};

// Middleware bất đồng bộ để kiểm tra xem người dùng với username đã cho có tồn tại trong cơ sở dữ liệu chưa
const checkExistingUser = async (
  req: Request<{}, {}, ICheckUsernameBody>,
  res: Response,
  next: NextFunction
) => {
  // Lấy username từ body của request
  const { username } = req.body;

  // Tìm kiếm người dùng trong cơ sở dữ liệu bằng username
  const existingUser = await findUserByUsername(username);
  // Nếu tìm thấy người dùng (nghĩa là username đã tồn tại)
  if (existingUser) {
    // Trả về response với mã trạng thái 409 (Conflict) và thông báo lỗi
    return next(new CustomError(StatusCodes.CONFLICT, "Username already exists."));
  }

  // Nếu không tìm thấy người dùng (username chưa tồn tại), chuyển quyền điều khiển sang middleware/handler tiếp theo
  next(); // Tiếp tục nếu người dùng không tồn tại
};

// Định nghĩa schema (cấu trúc và ràng buộc) cho dữ liệu đầu vào khi đăng nhập
const loginSchema = Joi.object({
  // Trường username hoặc email: phải là chuỗi và là trường bắt buộc
  username: Joi.string().required(),
  // Trường password: phải là chuỗi và là trường bắt buộc
  password: Joi.string().required(),
});

// Middleware để xác thực dữ liệu đầu vào cho chức năng đăng nhập sử dụng Joi
const validateLoginInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Thực hiện validate req.body dựa trên loginSchema
  const { error } = loginSchema.validate(req.body, { abortEarly: false }); // Giữ abortEarly: false để thấy tất cả lỗi input

  // Nếu có lỗi trong quá trình validation
  if (error) {
    // Trả về response với mã trạng thái 400 (Bad Request) và thông báo lỗi
    // Sử dụng error.message để lấy chuỗi tổng hợp các lỗi
    return next(new CustomError(StatusCodes.BAD_REQUEST, error.message));
  }

  // Nếu dữ liệu hợp lệ, chuyển quyền điều khiển sang middleware/handler tiếp theo
  next();
};

// Export các middleware
export { validateRegistrationInput, checkExistingUser, validateLoginInput };
