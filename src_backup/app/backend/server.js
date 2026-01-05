import express from "express";
import cors from "cors";
import generateRoute from "./routes/generate.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/generate", generateRoute);

app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001");
});