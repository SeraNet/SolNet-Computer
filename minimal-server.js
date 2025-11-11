import express from "express";
const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Minimal server is working!" });
});

app.get("/", (req, res) => {
  res.json({ message: "Minimal server is running" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
