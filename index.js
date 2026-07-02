import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "----",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if(checkResult.rows.length > 0){
      res.send("Email already exists Please enter another email");
    }
    else{
      const result = await db.query(
      "INSERT INTO users (email,password) VALUES ($1,$2) RETURNING* ", [email,password]);
      console.log(result);
      res.render("secrets.ejs");
    }
    
  }catch (err) {
    console.error(err);
    res.send("somthing went wrong");
  }

});

app.post("/login", async (req, res) => {
  
  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if(result.rows.length>0){
      const user = result.rows[0];
      const storedPassword = user.password;

      if(storedPassword === password){
        res.render("secrets.ejs");
      }else{
        res.send("Password Incorrect");
      }

    }
    else{
      res.send("User not Found");
    }

  } catch (err){
    console.error(err);
    res.send("something went wrong");
  }
  
});

  

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
