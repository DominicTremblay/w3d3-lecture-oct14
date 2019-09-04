const express = require('express');
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
let cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
// app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    keys: ['3326ec32-a41c-41e6-8619-cbafe93cf39b', '52329e8c-5082-4f95-911a-7d1da76c7c7f'],
  })
);
app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({ extended: false }));

// Creating a middleware to check if there is a currently logged in user
const currentUser = (req, res, next) => {
  // reading the cookie from the request
  const userId = req.session.user_id;

  console.log('Current user:');
  console.log({ userId }, users[userId]);

  // Attach the user object to the request if it exits
  req.user = users[userId] || null;

  // call the next middleware
  next();
};

app.use(currentUser);

const quotesDb = {
  'd9424e04-9df6-4b76-86cc-9069ca8ee4bb': {
    id: 'd9424e04-9df6-4b76-86cc-9069ca8ee4bb',
    quote: 'It’s not a bug. It’s an undocumented feature!',
  },
  '27b03e95-27d3-4ad1-9781-f4556c1dee3e': {
    id: '27b03e95-27d3-4ad1-9781-f4556c1dee3e',
    quote: 'Software Developer” – An organism that turns caffeine into software',
  },
  '5b2cdbcb-7b77-4b23-939f-5096300e1100': {
    id: '5b2cdbcb-7b77-4b23-939f-5096300e1100',
    quote:
   'If debugging is the process of removing software bugs, then programming must be the process of putting them in',
  },
  '917d445c-e8ae-4ed9-8609-4bf305de8ba8': {
    id: '917d445c-e8ae-4ed9-8609-4bf305de8ba8',
    quote: 'A user interface is like a joke. If you have to explain it, it’s not that good.',
  },
  '4ad11feb-a76a-42ae-a1c6-8e30dc12c3fe': {
    id: '4ad11feb-a76a-42ae-a1c6-8e30dc12c3fe',
    quote: 'If at first you don’t succeed; call it version 1.0',
  },
};

const quoteComments = {
  '70fcf8bd-6cb0-42f3-9887-77aa9db4f0ac': {
    id: '70fcf8bd-6cb0-42f3-9887-77aa9db4f0ac',
    comment: 'So awesome comment!',
    quoteId: 'd9424e04-9df6-4b76-86cc-9069ca8ee4bb',
  },
};

const users = {
  eb849b1f: {
    id: 'eb849b1f',
    name: 'Kent Cook',
    email: 'really.kent.cook@kitchen.com',
    password: 'cookinglessons',
  },
  '1dc937ec': {
    id: '1dc937ec',
    name: 'Phil A. Mignon',
    email: 'good.philamignon@steak.com',
    password: 'meatlover',
  },
};

const quoteList = () => {
  const quotes = {};

  for (const quoteId in quotesDb) {
    quotes[quoteId] = quotesDb[quoteId];
    quotes[quoteId].comments = Object.keys(quoteComments)
      .filter(commentId => quoteComments[commentId].quoteId === quoteId)
      .map(commentId => quoteComments[commentId]);
  }
  return quotes;
};

const findUser = email => Object.values(users).find(user => user.email === email);

const addNewUser = (name, email, password) => {
  const id = uuid().substr(0, 8);

  users[id] = {
    id,
    name,
    email,
    password,
  };

  return id;
};

const authenticateUser = (email, password) => {
  // does the user exists
  const user = findUser(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/register', (req, res) => {
  const templateVars = { currentUser: req.user };
  res.render('register', templateVars);
});

app.post('/users', (req, res) => {
  // extract info from the request body
  const { name, email, password } = req.body;

  // Find out if the user exists
  const user = findUser(email);

  // Add a new user to the db, unless the user exists
  if (user) {
    res.status(401).send('A user with that email already exists. Try to login.');
  } else {
    //encrypt the password
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, encryptedPassword) {
        // Store hash in your password DB.
        // create the user in the database
        const userId = addNewUser(name, email, encryptedPassword);
        // set the user id in the cookie
        req.session.user_id = userId;
        // redirect to the list of quotes
        res.redirect('/quotes');
      });
    });
  }
});

app.get('/login', (req, res) => {
  const templateVars = { currentUser: req.user };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // authenticate the user
  const user = authenticateUser(email, password);

  if (user) {
    // log the user in
    req.session.user_id = user.id;
    res.redirect('/quotes');
  } else {
    res.status(401).send('Wrong email or password');
  }
});

app.get('/', (req, res) => res.redirect('/quotes'));

app.get('/quotes', (req, res) => {
  const quotes = Object.values(quoteList());

  res.render('quotes', { quotes, currentUser: req.user });
});

app.delete('/login', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
