import Redis from 'ioredis'; // Sử dụng ioredis làm ví dụ

// Lấy cấu hình từ biến môi trường, hoặc dùng giá trị mặc định nếu không có
const redisConfig = {
  port: parseInt(process.env.REDIS_PORT || '6379', 10),       // đảm bảo là number
  host: process.env.REDIS_HOST || '127.0.0.1',
  password: process.env.REDIS_PASSWORD || undefined,          // bỏ null, dùng undefined
  db: parseInt(process.env.REDIS_DB || '0', 10),              // đảm bảo là number
};

// Tạo kết nối Redis
const redisClient = new Redis(redisConfig);

// Lắng nghe các sự kiện kết nối
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Export client để sử dụng ở các phần khác của ứng dụng
export default redisClient; 