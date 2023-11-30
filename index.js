import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
import pgPromise from 'pg-promise';
import Handlebars from 'handlebars';
import 'dotenv/config';



const connectionString = process.env.DATABASE_URL;
const pgp = pgPromise({});
const db = pgp(connectionString);


const app = express();

app.engine(
  'handlebars',
  engine({
    handlebars: Handlebars,
    helpers: {
      json: function (context) {
        return JSON.stringify(context);
      },
    },
  })
);

app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());




import FuelConsumption from './fuel-consumption.js';

const fuelConsumption = FuelConsumption(db);
// const fuelConsumptionAPI = FuelConsumptionAPI(fuelConsumption)


const PORT = process.env.PORT ;


// this renders the home page n which we can see all the vehicles added it will also add the new vehicles when use adds a new one
app.get('/', async function(req, res){
    const vehicles = await fuelConsumption.vehicles();
    res.render('listAllVehicles', { vehicles });
});


// this renders the form to add info on the new vehicle and thatwill then be added to the database
app.get('/addVehicle', async function (req, res) {

    // const viewVehicle = await fuelConsumption.vehicles();
    // console.log(viewVehicle);
    res.render('addVehicle');  
  });

// call the function that adds the vehciles take information from the req.body/input boxes
  app.post('/addVehicle', async function(req,res){
    // create const to fetch the input box info from the html and they will be the paramenter needed to add a new vehicle
    // to add the vehicle only need description and regnumber
    const description =  req.body.description;
    const regNumber = req.body.reg_number;
    

 


    const add = await fuelConsumption.addVehicle({ description, regNumber });
    
    console.log(add);
    res.redirect('/')
//    req.flash('message')

  })

// this renders the page to add info in order to refuel
  app.get('/refuel', async function (req, res) {
    const mes = req.flash('message')[0];
    res.render('refuel',{
        mes
    }); 
  });

// this should call the function to add to the fuel consumption and display in on the all vehicles ppage
  app.post('/refuel',async function (req,res){
// this informations comes from the input boxes from the form
    const id = req.body.vehicleId ;
    console.log(id);
    const liters = req.body.liters;
    const amountPaid = req.body.amountPaid;
    const distanceTravel = req.body.odometer;
    const fillUp = req.body.filledUp;
    console.log(fillUp);

    const fillupValue = fillUp === "true"
//   this function uses the input as parametrs to add it in the databsae via the paramters
   await fuelConsumption.refuel(id, liters, amountPaid, distanceTravel, fillupValue);

    // req.flash("message","hello world")

    res.redirect('/')

  })


  



app.listen(PORT, () => console.log(`App started on port: ${PORT}`));

