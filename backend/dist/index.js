"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database/database");
const attendance_1 = __importDefault(require("./routes/attendance"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
app.use((0, cors_1.default)({ origin: "http://localhost:5173" }));
app.use(express_1.default.json());
// Routes
app.use("/attendance", attendance_1.default);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
(0, database_1.initDatabase)().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
