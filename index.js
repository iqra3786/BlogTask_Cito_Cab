//............................................Import Modules ....................................................//

const express = require("express");
const app = express();
const mysql = require("mysql");
app.use(express.json());

//...........................................connect to database................................................//

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root123",
  database: "blog_app",
});

//...........................................check database connected or not.....................................//

connection.connect(function (err) {
  if (err) {
    console.log("error occurred while connecting", err.message);
  } else {
    console.log("connection created with Mysql successfully");
  }
});

//..............................................PORT..........................................................//

app.listen(3000, function () {
  console.log("running on port", 3000);
});


//.............................................Create Author to create the blog..............................//

app.post("/create", async (req, res) => {
  let { name, email } = req.body;
   await connection.query(
    "INSERT INTO authors (name,email) VALUES (? , ?)",
    [name, email],
    (err, result) => {
      if (err) {
        return res.status(400).send({status : false , message : "data not created"})
          .status(400)
          .send({ status: false, message: "data not created" });
      } else {
        console.log("sent");
        res.status(201).send(result[0])
      }
    }
  );
});

//......................................Create new blog.........................................................//   

app.post("/posts", (req, res) => {
  const { title, body, author_id, publication_date, tags } = req.body;
  //if tags are not provided,set it to an empty array
  const tagsArr=tags||[]

  // inserted new blog post into database
  const sql = `INSERT INTO posts (title, body, author_id, publication_date, tags)
                 VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    sql,
    [title, body, author_id, publication_date, JSON.stringify(tagsArr)],
    (err, result) => {
      if (err){
        console.error(err);
        res.status(500).send('internal server error')
        return;
      } 
      //  ID of newly created blog post
      const postId = result.insertId;
      const sql = `SELECT p.id, p.title, p.body, p.publication_date, a.name AS author_name, a.email AS author_email, GROUP_CONCAT(c.text SEPARATOR ';') AS comments
                   FROM posts p
                   INNER JOIN authors a ON p.author_id = a.id
                   LEFT JOIN comments c ON p.id = c.post_id
                   WHERE p.id = ?
                   GROUP BY p.id`;

      // console.log(sql);
      connection.query(sql, [postId], (err, results) => {
        if (err) throw err;
        res.status(201).send(results[0]);
      });
    }
  );
});

//...............................................fetch a list of blog posts........................................//

app.get("/posts", (req, res) => {
  const sql = `SELECT p.id, p.title, p.body, p.publication_date, a.name AS author_name, a.email AS author_email, GROUP_CONCAT(c.text SEPARATOR ';') AS comments
                 FROM posts p
                 INNER JOIN authors a ON p.author_id = a.id
                 LEFT JOIN comments c ON p.id = c.post_id
                 GROUP BY p.id`;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

//............................Retrieve a specific blog post by ID with its associated comments and authors..........//

app.get("/posts/:id", (req, res) => {
  const sql = `SELECT p.id, p.title, p.body, p.publication_date, a.name AS author_name, a.email AS author_email, GROUP_CONCAT(c.text SEPARATOR ';') AS comments
                 FROM posts p
                 INNER JOIN authors a ON p.author_id = a.id
                 LEFT JOIN comments c ON p.id = c.post_id
                 WHERE p.id = ?
                 GROUP BY p.id`;
  const postId = req.params.id;
  connection.query(sql, [postId], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.status(404).send("Post not found");
    } else {
      res.send(results[0]);
    }
  });
});

//........................................................update an existing blog by ID.............................//

app.put("/posts/:id", (req, res) => {
  const postId = req.params.id;
  const updatedPost = req.body;

  connection.query(
    "UPDATE posts SET title = ?, body = ?, author_id = ?, publication_date = ?, tags = ? WHERE id = ?",
    [
      updatedPost.title,
      updatedPost.body,
      updatedPost.author_id,
      updatedPost.publication_date,
      updatedPost.tags,
      postId,
    ],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      } else {
        if (results.affectedRows > 0) {
          res
            .status(200)
            .json({ message: `Post with ID ${postId} has been updated` });
        } else {
          res.status(404).json({ message: `Post with ID ${postId} not found` });
        }
      }
    }
  );
});

//..................................................delete an existing blog post by ID............................//

app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if the post exists
    const postExists = await connection.query("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    if (postExists.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Delete the post and associated comments
    await connection.query("DELETE FROM comments WHERE post_id = ?", [postId]);
    await connection.query("DELETE FROM posts WHERE id = ?", [postId]);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

