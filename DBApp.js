const mongoose = require('mongoose')
console.log("Mongo Uri=="+process.env.MLAB_URI);
mongoose.connect(process.env.MLAB_URI,{ useNewUrlParser: true } || 'mongodb://localhost/exercise-track');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB Connection error:'));
db.once('open', function() {
    console.log("We're connected to DB!");
});

const done=(err,data)=>{
    if(err){
        console.error("Oops DB Operation Failed. Detailes:"+JSON.stringify(err));
    }
    else{
        console.log("Good DB Operation Passed. Detailes:"+JSON.stringify(data));
    }
};

let Schema=mongoose.Schema;

let userSchema= new Schema({
    name:{type:String,default:"Ciga",required: true},
    password:{type: String,default: "don"},
    createdOn:{type:Date,default:Date.now()},
    userId:{type:String,unique:true},
});
const exerciseSchema= new Schema({
    userId:{type:String,required:true},
    description:{type:String ,default: 2},
    duration:{type:Number,required:true},
    date:{type:Date,default:Date.now()},
});
const User=mongoose.model('User',userSchema);
const Exercise=mongoose.model('Exercise',exerciseSchema);

var generatedId='_' + Math.random().toString(36).substr(2, 9);
let user1=new User({
    name: "Gufu Igbo",
    password: 'ciga',
    userId: generatedId
});
//Save an instance
//user1.save(done);


const  createNewUser=(newUser,done)=>{

  let  user= new User(newUser);
    user.save(function (err,data) {
        if(err)
            return done(err);
        done(null,data);
    });
};
const createNewExercise=(newExercise,done)=>{
    let exercise= new Exercise(newExercise);
    exercise.save(function (err,data) {
        if(err)
            return done(err);
        done(null,data);
    });
};

const updateUserId=(userId,done)=> {
    var IdGenerator=require('./Util').IDGenerator;
    var generatedId='_' + Math.random().toString(36).substr(2, 9);
    console.log("IdGenerated=="+generatedId);
    User.findByIdAndUpdate({_id:userId},{_id:generatedId},{new:true},function (err,data) {
        if(err)
            return done(err);
        done(null,data);
        console.log("The new user with updatedId=="+JSON.stringify(data));
    });
};
var findEditThenSave = function(personId,password, done) {
    var password="newpass"
    console.log("IdGenerated=="+generatedId);
    User.findById({_id:personId},function(err,data){
        console.log("persoinId key=="+personId);
        if(err)
            done(err)
        console.log(" Results of findPersonById Before Edit=="+JSON.stringify(data));
        data.password=password;
        data.save(function(err,data){
            if(err)
                done(err);
            console.log(" Results of findEditThenSave=="+JSON.stringify(data));
            done(null,data);

        });
    });
};
const findByUserId = function(userId,done) {
    User.findOne({userId:userId},function(err,data){
        if(err)
            done(err)
        console.log(" Results of findByUserId=="+JSON.stringify(data));
        done(null,data);
    });
};

const queryAllUsers=(done)=>{
  User.find({},function (err,data) {
     if(err)
         return done(err);
     done(null,data);
  });

};

const queryExercise=(userId,from,to,limitTo,done)=>{
   let query= Exercise.find({userId:userId});
   query.sort({description: 'asc'});
   query.select('-_id');
    if(from!=null)
        query.where('date').gte(from);
    if(to!=null)
        query.where('date').lte(to);
    if(limitTo!=null)
        query.limit(limitTo);
    query.exec(function (err,data) {
          if(err)
              return done(err);
          done(null,data);
       });
};

exports.createNewUser=createNewUser;
exports.updateUserId=updateUserId;
exports.createNewExercise=createNewExercise;
exports.queryExercise=queryExercise;
exports.findByUserId=findByUserId;
exports.queryAllUsers=queryAllUsers;