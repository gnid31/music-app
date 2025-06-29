// src/config/swagger.ts

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0', // Phiên bản OpenAPI Specification
  info: {
    title: 'Music App API Documentation', // Tiêu đề API của bạn
    version: '1.0.0', // Phiên bản API của bạn
    description: 'API documentation for the Music Application', // Mô tả API
  },
  servers: [
    {
      // url:, // Base path cho các endpoint API của bạn (ví dụ: http://localhost:3000/api)
      url: process.env.BACKEND_URL || 'http://localhost:3000/api', // Lấy từ biến môi trường hoặc mặc định
      description: 'Development server',
    },
     // Thêm các server khác nếu có (staging, production...)
  ],
  components: {
      securitySchemes: {
          bearerAuth: { // Cấu hình Bearer Token Authentication nếu bạn có middleware xác thực
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
          },
      },
  },
  // Bạn có thể thêm definitions/schemas chung ở đây nếu cần
};

const options = {
  swaggerDefinition,
  // Đường dẫn tới các file chứa comment JSDoc/TSDoc
  // Sử dụng globs để bao gồm tất cả các file route và controller
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    // Thêm các đường dẫn khác nếu API logic nằm ở nơi khác (services, etc.)
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
