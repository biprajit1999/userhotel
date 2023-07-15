let express = require('express');
let env = require('dotenv').config();
let ejs = require('ejs');
let path = require('path');
let app = express();
let bodyParser = require('body-parser');

let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
const nodemailer = require('nodemailer');

mongoose.connect('mongodb+srv://biprajit:biprajit@cluster0.has27be.mongodb.net/hotelty?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

let index = require('./routes/index');
app.use('/', index);



app.post('/submit_form', function(req, res) {
  let name = req.body.name;
  let phone = req.body.phone;
  let aadhar = req.body.aadhar;
  let room = req.body.room;
  let checkIn = new Date(req.body.checkIn);
  let checkOut = new Date(req.body.checkOut);
  let email = req.body.email;

  let data = {
    "name": name,
    "phone": phone,
    "aadhar": aadhar,
    "room": room,
    "checkIn": checkIn,
    "checkOut": checkOut,
    "email": email
  };

  db.collection('detail').findOne({ aadhar: aadhar }, function(err, result) {
    if (err) throw err;

    if (result) {
      return res.redirect('/duplicate');
    } else {
      db.collection('detail').findOne({
        room: room,
        $or: [
          { $and: [{ checkIn: { $lte: checkIn } }, { checkOut: { $gt: checkIn } }] },
          { $and: [{ checkIn: { $lt: checkOut } }, { checkOut: { $gte: checkOut } }] },
          { $and: [{ checkIn: { $gte: checkIn } }, { checkOut: { $lte: checkOut } }] }
        ]
      }, function(err, result) {
        if (err) throw err;

        if (result) {
          return res.redirect('/roombooked');
        } else {
          db.collection('detail').insertOne(data, function(err, collection) {
            if (err) throw err;
            console.log("Record inserted successfully");
            sendConfirmationEmail(email, name, room, checkIn, checkOut);
          });

          return res.redirect('/success');
        }
      });
    }
  });
});


function sendConfirmationEmail(email, name, room, checkIn, checkOut) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: 'biprajitdebnath99@gmail.com',
      pass: 'eoylpqdcvwdcwbcg' 
    }
  });

  let mailOptions = {
    from: 'biprajitdebnath99@gmail.com',
    to: email,
    subject: 'Room Registration Confirmation',
    html: `
      <h1>🙏 Welcome to Paradise Cove Retreat 🙏 </h1>
      <h2>Hello ${name},</h2>
      <p>Your room (${room}) has been successfully registered.</p>
      <p>Check-in: ${checkIn}</p>
      <p>Check-out: ${checkOut}</p>
      <p>Thank you for choosing our hotel. We look forward to serving you!</p>
      <p>For any further queries, please feel free to reach out to us:</p>
      <p>Email: <a href="mailto:debnathbiprajit@gmail.com">debnathbiprajit@gmail.com</a></p>
      <p>Contact: 8535062381</p>
    `
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}




app.post('/submit-feedback', (req, res) => {
  const {
      'rating-hotel': ratingHotel,
      'rating-reception': ratingReception,
      'rating-cleanliness': ratingCleanliness,
      'rating-amenities': ratingAmenities,
      'rating-location': ratingLocation,
      'rating-food': ratingFood,
      'rating-staff': ratingStaff,
      'rating-value': ratingValue,
      name,
      phone,
      comment,
      email
  } = req.body;
  db.collection('feedbacks').findOne({ phone: phone }, function(err, result) {
      if (err) throw err;

      if (result) {
          return res.redirect('/fb_failure');
      } else {
          db.collection('feedbacks').insertOne(
              {
                  name,
                  phone,
                  ratingHotel,
                  ratingReception,
                  ratingCleanliness,
                  ratingAmenities,
                  ratingLocation,
                  ratingFood,
                  ratingStaff,
                  ratingValue,
                  comment,
                  email
              },
              function(err, collection) {
                  if (err) throw err;
                  console.log('Feedback inserted successfully');
                  sendFeedbackEmail(email, name);
              }
          );
          return res.redirect('/fb_success');
      }
  });
});

function sendFeedbackEmail(email, name) {
  let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'biprajitdebnath99@gmail.com',
        pass: 'eoylpqdcvwdcwbcg' 
      }
  });

  let mailOptions = {
      from: 'biprajitdebnath99@gmail.com',
      to: email,
      subject: 'Feedback Submission Confirmation',
      html: `
      <h1>🙏 Greetings of the Day 🙏 </h1>
          <h2>Thank you for your feedback, ${name}!</h2>
          <p>We appreciate your valuable feedback and will take it into consideration to improve our services.</p>
          <p>Thank you once again for taking the time to share your feedback with us.</p>
    <p>For any further queries, please feel free to reach out to us:</p>
    <p>Email: <a href="mailto:debnathbiprajit@gmail.com">debnathbiprajit@gmail.com</a></p>
    <p>Contact: 8535062381</p>
      `
  };

  transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
          console.log(err);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
}


app.post('/check_room_availability', function(req, res) {
  let room = req.body.room;
  let checkIn = new Date(req.body.checkIn);
  let checkOut = new Date(req.body.checkOut);

  db.collection('detail').findOne({
      room: room,
      $or: [
          { $and: [{ checkIn: { $lte: checkIn } }, { checkOut: { $gt: checkIn } }] },
          { $and: [{ checkIn: { $lt: checkOut } }, { checkOut: { $gte: checkOut } }] },
          { $and: [{ checkIn: { $gte: checkIn } }, { checkOut: { $lte: checkOut } }] }
      ]
  }, function(err, result) {
      if (err) throw err;

      if (result) {
          return res.redirect('/roombooked');
      } else {
          return res.redirect('/create');
      }
  });
});



app.use(function (req, res, next) {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Server is started on http://127.0.0.1:'+PORT);
});
