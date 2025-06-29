declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      username: string;
      // Thêm các thuộc tính khác của đối tượng user nếu cần
    };
  }
} 