import express from "express";
const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/", (req, res) => {
  res.json({ message: "Test server is running" });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
