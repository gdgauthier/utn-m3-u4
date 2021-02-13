'use strict'
const EXPRESS = require('express');
const PATH = require('path');
const MYSQL = require('mysql');
const UTIL = require('util');
const APP = EXPRESS();
const PORT = process.env.PORT || 3000;

const CONNECTION = MYSQL.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'm3u4'
});

const QY = UTIL.promisify(CONNECTION.query).bind(CONNECTION);

APP.use(EXPRESS.urlencoded({extended: true}))
APP.use(EXPRESS.static('public'));
APP.set('views', PATH.join(__dirname, 'views'));
APP.set('view engine', 'ejs');

APP.route('/data')
.get(async (req, res) => {
  try {
    let query = 'SELECT * FROM person';    
    let data = await QY(query);
    let obj = {};
    obj = {data: data};    
    res.render("data", obj);
  } catch (error) {
      console.log(error.message);
      res.status(413).send({"Error: ": error.message});
  }
});

APP.route('/')
.post(async (req, res) => {  
  try {
    if (!req.body.name || !req.body.lastName){
      throw new Error("Name and Last Name are mandatory.");
    }
    let query = 'SELECT id FROM person WHERE name = ? AND lastName = ?';
    let data = await QY(query, [req.body.name, req.body.lastName]);        
    if (data.length > 0){
      throw new Error("That person already exists.");
    }
    query = 'INSERT INTO person (name, lastName, age, mobileNumber, countryOrigin, countryResidence) VALUE (?,?,?,?,?,?)';
    data = await QY(query, [req.body.name, req.body.lastName, req.body.age, req.body.mobileNumber, req.body.countryOrigin, req.body.countryResidence]);
    res.redirect('/');
  }
  catch (error) {
    console.log(error.message);
    res.status(413).send({"Error: ": error.message});
  }
});

CONNECTION.connect((error) => {
  if(error) {
    throw error;
  }
  console.log("Connected to Database");
});

APP.listen(PORT, () => {
  console.log("Server listening on port",PORT);
});