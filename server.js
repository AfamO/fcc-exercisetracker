const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const DBApp=require('./DBApp');

const cors = require('cors')

var generatedId='_' + Math.random().toString(36).substr(2, 9);
var newUser={
  name: "Afam O",
  password: 'kaio',
  userId:generatedId,
};
var newExercise={
  userId: "_tw1xn901i",
  description:"Dancing",
  duration:50,
  date:new Date().toLocaleDateString(),
};
var createNewUser=DBApp.createNewUser;
var updateUserId=DBApp.updateUserId;
const createNewExercise=DBApp.createNewExercise;
const  queryExercise=DBApp.queryExercise;
const findByUserId=DBApp.findByUserId;
const queryAllUsers=DBApp.queryAllUsers;

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let Log=function (description,duration,date){
  let days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  this.description=description;
  this.duration=duration;
  this.date=date.toString();
};

const User= function(_id,username){
  this._id=_id;
  this.username=username;
}


//Query a user  exercise log and return the RIGHT response
app.get('/api/exercise/log?',function (req,res) {
  if (req.query == null || req.query.userId==null)
    res.send({"errorMsg": "OOOps something went wrong!: query parameters are missing-you MUST provide atleast userId"});
  console.log("Query sent==" + JSON.stringify(req.query));
  findByUserId(req.query.userId, function (err, data) {
    if (err) {
      console.log("OOps: Error get User: Details==" + JSON.stringify(err));
      res.send({"errorMsg": "OOOps something went wrong!: Contact Admin"});
    }
    console.log("Successfully Querried User ::" + JSON.stringify(data));
    if (data!= null)
    {
      let userName = data.name;
      let userId = req.query.userId;
      let from = req.query.from;
      let to = req.query.to;
      let limit = parseInt(req.query.limit);
      queryExercise(userId, from, to, limit, function (err, data) {
        if (err)
          console.log("OOps error querrying exercises .Details==" + JSON.stringify(err));
        console.log("Successfully Querried Exercises::" + JSON.stringify(data));
        if(data.length > 0)
        {
          let response={
            "_id":data[0].userId,
            "username":userName,
          };
          if(from!=null)
            response.from=from;
          if(to!=null)
            response.to=to;
          response.count=data.length;
          const exerciseLogsFromByMap=data.map((log)=>new Log(log.description,log.duration,log.date));
          response.log=exerciseLogsFromByMap;
          res.json(response);
        }
        else {
          res.json({"errorMsg": "OOOps something went wrong!: No exercises found  the current search parameters, tweak it."});
        }

      });// End query Exercise.
    }
    else
    {
      res.send({"errorMsg": "OOOps something went wrong!: The User with '" + req.query.userId + "' doesn't exist"});
    }

  });//End findByUserId
});
//Create a user and return the RIGHT response
app.post('/api/exercise/new-user',function (req,res) {
  if(req.body==null)
    res.send({"errorMsg":"OOOps something went wrong!: form fields sent"});
  newUser={
    name: req.body.username,
    password: req.body.password,
    userId:generatedId,
  };
  createNewUser(newUser,function (err,data) {
    if(err)
      console.log("OOps error creating new user");
    console.log("Successfully Created new User::"+JSON.stringify(data));
    res.json({username:data.name,userId:data.userId});

  });
});

//Create a user and return the RIGHT response
app.get('/api/exercise/users',function (req,res) {
  if(req.body==null)
    res.send({"errorMsg":"OOOps something went wrong!: form fields sent"});
  newUser={
    name: req.body.username,
    password: req.body.password,
    userId:generatedId,
  };
  queryAllUsers(function (err,data) {
    if(err)
      console.log("OOps error creating new user");
    console.log("Successfully Created new User::"+JSON.stringify(data));
    const usersLists= data.filter((user)=>user.userId!=null).map((user)=> new User(user.userId,user.name))
    res.json(usersLists);

  });
});
//_344rdnfah

//Create a user's exercise and return the RIGHT response
app.post('/api/exercise/add',function (req,res) {
  if(req.body==null)
    res.send({"errorMsg":"OOOps something went wrong!: form fields sent"});
  console.log("The Query Body=="+JSON.stringify(req.body));
  let myDate = new Date().toString();
  console.log("my date initially=="+myDate)
  //If no date is passed,let the current date be the exercise date.
  if(req.body.date!=""){
    myDate=req.body.date;
    console.log("my date initially is now =="+myDate);
  }
  findByUserId(req.body.userId,function (err,data) {
    if(err)
    {
      console.log("OOps: Error get User: Details=="+JSON.stringify(err));
      res.send({"errorMsg":"OOOps something went wrong!: Contact Admin"});
    }
    console.log("Successfully Querried User ::"+JSON.stringify(data));
    if(data.name==null)
      res.send({"errorMsg":"OOOps something went wrong!: The User with '"+req.body.userId+"' doesn't exist"});
    let userName=data.name;
    console.log("My Date=="+myDate);
    newExercise={
      userId: req.body.userId,
      description:req.body.description,
      duration:req.body.duration,
      date: req.body.date==""?new Date().toString():req.body.date,
    };
    console.log("My newExercise Date Again=="+newExercise.date);
    //Then go ahead and create new exercise.
    createNewExercise(newExercise,function (err,data) {
      if(err)
        console.log("OOps: Error creating excercise: Details=="+JSON.stringify(err));
      console.log("Successfully Created new Exercise::"+JSON.stringify(data));
      let exerciseResp={
        name: userName,
        description:data.description,
        duration:data.duration,
        date:data.date
      }
      res.json(exerciseResp);
    });

  });//Ends FindByUserId

});
// Not found middleware

app.use((req, res, next) => {
  return next({status: 404, message: 'NOT FOUND'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
