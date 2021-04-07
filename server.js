
const bodyparser = require('body-parser')
const express = require("express");
const app = express();
var mongoose = require('mongoose');

app.use(express.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());


var mongodbUri = "mongodb://" + process.env.LOGIN + ":" + process.env.PASSWORD + "@szantog82-shard-00-00.1dmlm.mongodb.net:27017,szantog82-shard-00-01.1dmlm.mongodb.net:27017,szantog82-shard-00-02.1dmlm.mongodb.net:27017/szantog82?ssl=true&replicaSet=atlas-zj6i4v-shard-0&authSource=admin&retryWrites=true&w=majority";



var mongoConn = mongoose.connect(mongodbUri,{ useNewUrlParser: true , useUnifiedTopology: true}, function(error) {
  console.log("Error connecting to mongoDb: " + error)
});
var mongoCollection = mongoose.connection.collection('Tankolas');

app.get("/", function(req, res) {
    res.end("<h1>Tankolas konyvelo DB kapcsolat</h1>");
});

app.post("/get_data", function(req, res){
  var plateNumber = req.body.plateNumber;
  console.log("Incoming request (get_data): " + plateNumber);
  mongoCollection.find({plateNumber: plateNumber}, function(err, data) {
        data.toArray(function(err2, items) {
            data.forEach(function (item, index){
              //if (index == 0){
              var output = {
                car: item.car,
                chalks: item.chalks
              };
               res.end(JSON.stringify(output));      
            //  }
            })
        })
      })
});

app.post("/upload_data", function(req, res){
  var arr = JSON.parse(req.body["data"]);
  var car = JSON.parse(arr["car"]);
  var chalks = JSON.parse(arr["chalks"]);
  var upload = {
    plateNumber: car.licensePlateNumber,
    car: car,
    chalks: chalks
  };
  if (car.licensePlateNumber.length > 3){
  mongoCollection.deleteMany({ plateNumber: car.licensePlateNumber}, function (err, res){
      mongoCollection.insertOne(upload);
    console.log("deleteMany err:" + err);
  });
  console.log("inserting new data; plateNumber: " + car.licensePlateNumber + ", " + "no. of chalks:" + chalks.length);
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
