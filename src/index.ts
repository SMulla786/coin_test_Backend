import express from "express";
import { PrismaClient } from "@prisma/client";
import todoRouter from "./routes/todoRoutes";

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Coin API!");
});

// Use Coin routes
app.use("/api/coin", todoRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
