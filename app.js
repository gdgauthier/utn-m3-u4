'use strict'
const EXPRESS = require('express');
const APP = EXPRESS();
const PATH = require('path');
const MYSQL = require('mysql');
const UTIL = require('util');
const METHOD_OVERRIDE = require('method-override');
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
APP.use(METHOD_OVERRIDE('_method'));
APP.set('views', PATH.join(__dirname, 'views'));
APP.set('view engine', 'ejs');

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
})

APP.route('/data/:id')
.get(async (req, res) => {
  try {
    let query = 'SELECT * FROM person WHERE id = ?';
    let data = await QY(query, [req.params.id]);
    let obj = {};
    obj = {data: data};    
    res.render("edit", obj);
  } catch (error) {
      console.log(error.message);
      res.status(413).send({"Error: ": error.message});
  }
})
.put(async (req, res) => {
  try {
    if (!req.body.name || !req.body.lastName){
      throw new Error("Name and Last Name are mandatory.");
    }
    let query = 'SELECT id FROM person WHERE name = ? AND lastName = ? AND id <> ?';
    let data = await QY(query, [req.body.name, req.body.lastName, req.params.id]);        
    if (data.length > 0){
      throw new Error("That person already exists.");
    }
    query = 'UPDATE person SET name = ?, lastName = ?, age = ?, mobileNumber = ?, countryOrigin = ?, countryResidence = ? WHERE id = ?';
    data = await QY(query, [req.body.name, req.body.lastName, req.body.age, req.body.mobileNumber, req.body.countryOrigin, req.body.countryResidence, req.params.id]);
    res.redirect('/data');
  }
  catch (error) {
    console.log(error.message);
    res.status(413).send({"Error: ": error.message});
  }
})
.delete(async (req, res) => {
  try {    
    let query = 'DELETE FROM person WHERE id = ?';        
    let data = await QY(query, [req.params.id]);        
    res.redirect('/data');
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
