import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      "https://pideon.vercel.app",
      "https://pideon-*.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ message: "API PideON funcionando correctamente" });
});

app.use("/api", routes);
app.use(errorMiddleware);

export default app;
