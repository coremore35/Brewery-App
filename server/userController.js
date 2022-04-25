const bcrypt = require("bcrypt");
/// Added the db requirement - will need to be updated when we put in correct folder
const db = require("./db.js");

const userController = {};

userController.createUser = async (req, res, next) => {
  /*
//FOR GETTING ALL 'ALREADY USED USERNAMES' PASSWORDS FROM USER TABLE IN DB
const queryString = `SELECT username FROM users`
const alreadyUsed = await db.query(queryString);
*/
  try {
    if (!req.body.userInfo.username || !req.body.userInfo.password)
      return next("missing username or password in createUser");

    const { firstname, lastname, homestate, username, password } = req.body.newUser;

    //use bcrypt to hash the password, salting it 10 times
    const hashedPassword = await bcrypt.hash(password, 10);
    const queryString = `INSERT INTO users (firstname, lastname, homestate, username, password) VALUES ($1, $2, $3, $4, $5)`;
    const value = [
      firstname,
      lastname,
      homestate,
      username,
      hashedPassword
    ];
    db.query(queryString, value);
    return next();
  } catch (err) {
    console.log(err);
    res.redirect("/createuser");
  }
};

userController.verifyLogin = async (req, res, next) => {
  if (req.body.userInfo.username == null) return res.status(400).send("Must provide a username");
  if (req.body.userInfo.password == null) return res.status(400).send("Must provide a password");

  try {
    const queryString = `SELECT password FROM users WHERE username=${req.body.userInfo.username}`;
    const dbPassword = await db.query(queryString);
    if (!dbPassword[0]) return res.send('Username does not exist');
    if (await bcrypt.compare(req.body.userInfo.password, dbPassword)) {
      next();
    } else {
      res.send("Incorrect password");
    }
  } catch (err) {
    console.log(err);
  };
};

userController.setCookie = (req, res, next) => {
  // set cookie with a name, value (in this case the username)
  // httpOnly prevents the client from editing cookie in the browser
  res.cookie("BrewCookie", req.body.userInfo.username, { httpOnly: true });
  return next();
};

module.exports = userController;

