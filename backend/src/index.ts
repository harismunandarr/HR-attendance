import express from "express";
import cors from "cors";
import { initDatabase } from "./database/database";
import attendanceRouter from "./routes/attendance";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/attendance", attendanceRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
