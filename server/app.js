const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors()); // すべてのルートでCORSを許可
app.use(express.json()); // JSON形式のリクエストボディを解析するために必要
require('dotenv').config(); //DB情報のハードコーディングを避ける

// MySQLデータベース接続設定
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// データベース接続
connection.connect();

// 新しい単語を登録するエンドポイント
app.post("/api/words", (req, res) => {
  const { word, translation, example } = req.body;
  const query = "INSERT INTO words (word, translation, example) VALUES (?, ?, ?)";
  
  connection.query(query, [word, translation, example], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "単語の追加に失敗しました" }); // JSON形式でエラーメッセージを送信
      return;
    }
    res.status(201).json({ message: "単語が追加されました" }); // JSON形式で成功メッセージを送信
  });
});

// 単語のリストを取得するためのGETエンドポイント
app.get("/api/words", (req, res) => {
  const query = 'SELECT * FROM words'; 
  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("単語が取得できませんでした");
      return;
    }
    res.status(200).json(results);
  });
});

// 単語を削除するためのDELETEエンドポイント
app.delete("/api/words/:id", (req, res) => {
  const { id } = req.params; // URLパラメータから単語のIDを取得
  const query = "DELETE FROM words WHERE id = ?"; // 単語を削除するSQLクエリ

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "単語の削除に失敗しました" }); 
      return;
    }
    if (results.affectedRows === 0) {
      // IDに該当する単語が見つからなかった場合
      res.status(404).json({ message: "単語が見つかりません。" });
      return;
    }
    res.status(200).json({ message: "単語が削除されました" }); 
  });
});

app.listen(PORT, () => {
  console.log(`サーバー起動中 http://localhost:${PORT}`);
});

// 単語を編集するためのPUTエンドポイント
app.put("/api/words/:id", (req, res) => {
  const { id } = req.params; // URLパラメータから単語のIDを取得
  const { word, translation, example } = req.body; // リクエストボディから編集内容を取得
  const query = "UPDATE words SET word = ?, translation = ?, example = ? WHERE id = ?";

  connection.query(query, [word, translation, example, id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "更新に失敗しました。" });
      return;
    }
    if (results.affectedRows === 0) {
      // IDに該当する単語が見つからなかった場合
      res.status(404).json({ message: "単語が見つかりません。" });
      return;
    }
    res.status(200).json({ message: "単語が更新されました。" });
  });
});

// 単語の難易度を更新するためのPUTエンドポイント
app.put("/api/words/:id/difficulty", (req, res) => {
  const { id } = req.params;
  const { difficulty } = req.body;
  const query = "UPDATE words SET difficulty = ? WHERE id = ?";

  connection.query(query, [difficulty, id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "難易度の更新に失敗しました。" });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: "単語が見つかりません。" });
      return;
    }
    res.status(200).json({ message: "単語の難易度が更新されました。" });
  });
});