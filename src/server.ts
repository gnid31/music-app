import express from "express";
import routes from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import cors from 'cors';

const app = express();

const PORT = 8080;
// const PORT = 3000;



app.use(cors());

// Thêm middleware này VÀO ĐÂY, trước các route hoặc middleware khác
// để xử lý JSON body của request
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use("/", routes);
app.use("/api", routes);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0');

// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// });

export default app;
