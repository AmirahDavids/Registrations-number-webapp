const express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

const flash = require('express-flash');
const session = require('express-session');

const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://amirah:coder123@localhost:5432/registration_db';
const pool = new Pool({
  connectionString
});
const Factory = require("./registration");
const factory = Factory(pool);

let app = express();

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json())

app.use(flash());

app.use(session({
  secret: "<add a secret string here>",
  resave: false,
  saveUninitialized: true
}));

// Routes

app.get("/", async function (req, res) {
  res.render('index', {
    vehicle: await factory.getRegList(),
    place: await factory.listOfPlaces()
  });
});

app.post('/registrations', async function (req, res) {

  var plate = req.body.reg
  var color = "";
  if (factory.validateReg(plate)) {
    var formattedPlate = factory.formatPlate(plate);
    var added = await factory.addRegToDatabase(formattedPlate)
    if (added) {
      color = "gr"
      req.flash(
        "info", "Number Plate is added successfully"
      );
    } else {
      color = "b"
      req.flash(
        "info", "Duplicate plate found"
      );
    }
  } else {
    color = "rd"
    req.flash(
      "info", "Number Plate is not valid"
    );
  }

  res.render('index', {
    col: color,
    vehicle: await factory.getRegList(),
    place: await factory.listOfPlaces()
  });
});

app.post("/filter", async function (req, res) {
  res.render('index', {
    vehicle: await factory.filterByTown(req.body.towns),
    place: await factory.listOfPlaces()
  });

});

app.post("/clear", async function (req, res) {
  await factory.clearDatabase();
  res.redirect('/');
});

app.get("/reg_number/:reg", async function (req, res) {
  var registration = factory.formatPlate(req.params.reg);
  console.log(registration);
  res.render('index', {
    vehicle: [{
      'registration':registration
    }]
  });
});
    
let PORT = process.env.PORT || 3017;
app.listen(PORT, function () {
  console.log('App starting on port', PORT);
});