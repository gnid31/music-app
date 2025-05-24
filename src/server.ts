import express from "express";
import routes from './routes/index'
import { errorHandler } from './middlewares/errorHandler'

const app = express();
const PORT = 3000;

// Thêm middleware này VÀO ĐÂY, trước các route hoặc middleware khác
// để xử lý JSON body của request
app.use(express.json());

app.use('/', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
