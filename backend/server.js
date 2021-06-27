//importing required modules
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//include model collections from models folder
const User = require('./models/User')

//connect to mongodb online
mongoose.connect('mongodb+srv://username:password@clustername.elei8.mongodb.net/databasename?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });


//initialize the app
const app = express();

//import required middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cors())


//Routes
//Signup --- post route
app.post('/signup', (req, res, next) => {
    const newUser = new User({
      email: req.body.email,
      name: req.body.name,
      password: bcrypt.hashSync(req.body.password, 10)
    })
    newUser.save(err => {
      if (err) {
        return res.status(400).json({
          title: 'error',
          error: 'email in use'
        })
      }
      return res.status(200).json({
        title: 'signup success'
      })
    })
  })

//Login ---post route
app.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).json({
        title: 'server error',
        error: err
      })
      if (!user) {
        return res.status(401).json({
          title: 'user not found',
          error: 'invalid credentials'
        })
      }
      //incorrect password
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(401).json({
          tite: 'login failed',
          error: 'invalid credentials'
        })
      }
      //IF ALL IS GOOD create a token and send to frontend
      let token = jwt.sign({ userId: user._id}, 'secretkey');
      return res.status(200).json({
        title: 'login sucess',
        token: token
      })
    })
  })
  
  //grabbing user info
  app.get('/user', (req, res, next) => {
    let token = req.headers.token; //token
    jwt.verify(token, 'secretkey', (err, decoded) => {
      if (err) return res.status(401).json({
        title: 'unauthorized'
      })
      //token is valid
      User.findOne({ _id: decoded.userId }, (err, user) => {
        if (err) return console.log(err)
        return res.status(200).json({
          title: 'user grabbed',
          user: {
            email: user.email,
            name: user.name
          }
        })
      })
  
    })
  })
//define the port
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Your server is running')
})

//port listening
app.listen(PORT, (err) => {
    if (err) return console.log(err);
    console.log(`Server is running on port: ${PORT}`)
})
