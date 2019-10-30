const express = require('express');
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const uuid = require('uuid/v4'); // uuid generates a random string

const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

// Serve static assets(css, images, etc) from the public folder
app.use(express.static('public'));

// Set the view engine to ejs. Default is pug
app.set('view engine', 'ejs');

// Activate bodyParser, a middleware that extracts the data of a post request
app.use(bodyParser.urlencoded({ extended: false }));

const quotesDb = {
  'd9424e04-9df6-4b76-86cc-9069ca8ee4bb': {
    id: 'd9424e04-9df6-4b76-86cc-9069ca8ee4bb',
    quote: 'It’s not a bug. It’s an undocumented feature!',
    userId: 'eb849b1f',
  },
  '27b03e95-27d3-4ad1-9781-f4556c1dee3e': {
    id: '27b03e95-27d3-4ad1-9781-f4556c1dee3e',
    quote:
      'Software Developer” – An organism that turns caffeine into software',
    userId: 'eb849b1f',
  },
  '5b2cdbcb-7b77-4b23-939f-5096300e1100': {
    id: '5b2cdbcb-7b77-4b23-939f-5096300e1100',
    quote:
      'If debugging is the process of removing software bugs, then programming must be the process of putting them in',
    userId: 'eb849b1f',
  },
  '917d445c-e8ae-4ed9-8609-4bf305de8ba8': {
    id: '917d445c-e8ae-4ed9-8609-4bf305de8ba8',
    quote:
      'A user interface is like a joke. If you have to explain it, it’s not that good.',
    userId: '1dc937ec',
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
    userId: '1dc937ec',
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

// Get the list of quotes with the associated comments
// use the (...) spread operator to copy an object
// use Object.keys to make an array out of the keys of an object
// use filter and map functions

const quoteList = () => {
  const quotes = {};

  for (const quoteId in quotesDb) {
    // {...} makes a copy of the object.
    quotes[quoteId] = { ...quotesDb[quoteId] };
    quotes[quoteId].comments = Object.keys(quoteComments)
      .filter(commentId => quoteComments[commentId].quoteId === quoteId)
      .map(commentId => quoteComments[commentId]);
  }
  return quotes;
};

// We want to check if that email exists in users db
const findUser = email => {
  // itetrate through the users object
  for (let userId in users) {
    const currentUser = users[userId];

    if (currentUser.email === email) {
      return currentUser;
    }
  }

  return false;
};

// Adding the user to the users DB
const addUser = (name, email, password) => {
  const id = uuid();

  const newUser = {
    id,
    name,
    email,
    password,
  };

  users[id] = newUser;

  return id;
};
// Dev routes so we see the users db
app.get('/db/users', (req, res) => {
  res.json(users);
});

// Dev routes so we see the quotes db
app.get('/db/quotes', (req, res) => {
  res.json(quotesDb);
});

// Dev routes so we see the quotes db with the comments
app.get('/db/quotes_comments', (req, res) => {
  res.json(quoteList());
});

// Redirect to /quotes
app.get('/', (req, res) => res.redirect('/quotes'));

// Render the page to display the list of quotes
app.get('/quotes', (req, res) => {
  const quotes = Object.values(quoteList());

  res.render('quotes', { quotes });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // extract the info from the form

  // const name = req.body.name;
  // const email = req.body.email;
  // const password = req.body.password;

  // es6 desctructuring doing the above 3 statements
  const { name, email, password } = req.body;

  // check if everything is valid

  const user = findUser(email);

  // check if the user already exists

  if (user) {
    res.status(401).send('That user already exist!');
    return;
  }

  const userId = addUser(name, email, password);

  // set a cookie to log in the user
  res.cookie('user_id', userId);

  res.redirect('/db/users'); //'/quotes' (/db/users)
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
