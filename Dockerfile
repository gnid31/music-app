# Sử dụng ảnh nền Node.js LTS
FROM node:lts-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy package.json và package-lock.json (hoặc yarn.lock)
# Copy riêng để tận dụng cache của Docker khi build
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Copy toàn bộ mã nguồn còn lại vào thư mục làm việc
COPY . .

RUN npx prisma generate
# Nếu bạn sử dụng TypeScript hoặc cần bước build khác, hãy thêm vào đây.
# Giả sử script build của bạn là "npm run build" và output ra thư mục "dist".
RUN npm run build

# Mở cổng mà ứng dụng Node.js của bạn lắng nghe (mặc định thường là 3000)
# Cần điều chỉnh nếu ứng dụng của bạn lắng nghe ở cổng khác
EXPOSE 8080

# Lệnh để chạy ứng dụng sau khi container khởi động
# Giả sử file entry point sau khi build là dist/server.js
RUN chmod +x wait-for-it.sh entrypoint.sh

CMD ["./entrypoint.sh"]