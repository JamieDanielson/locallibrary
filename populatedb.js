#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and owned books to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true',
);

// Get arguments passed on command line
let userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
let async = require('async');
let Book = require('./models/book');
let Author = require('./models/author');
let Genre = require('./models/genre');
let Owned = require('./models/owned');

let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let authors = [];
let genres = [];
let books = [];
let owned = [];

function authorCreate(first_name, last_name, cb) {
  let authordetail = { first_name: first_name, last_name: last_name };

  let author = new Author(authordetail);

  author.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Author: ' + author);
    authors.push(author);
    cb(null, author);
  });
}

function genreCreate(name, cb) {
  let genre = new Genre({ name: name });

  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre);
    cb(null, genre);
  });
}

function bookCreate(title, summary, author, genre, cb) {
  let bookdetail = {
    title: title,
    author: author,
    summary: summary,
  };
  if (genre != false) {
    bookdetail.genre = genre;
  }

  let book = new Book(bookdetail);
  book.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Book: ' + book);
    books.push(book);
    cb(null, book);
  });
}

function ownedCreate(book, status, cb) {
  let owneddetail = {
    book: book,
  };
  if (status != false) {
    owneddetail.status = status;
  }
  let owned = new Owned(owneddetail);
  owned.save(function (err) {
    if (err) {
      console.log('ERROR CREATING owned: ' + owned);
      cb(err, null);
      return;
    }
    console.log('New owned: ' + owned);
    owned.push(owned);
    cb(null, book);
  });
}

function createGenreAuthors(cb) {
  async.series(
    [
      function (callback) {
        authorCreate('George', 'Orwell', callback);
      },
      function (callback) {
        authorCreate('Neal', 'Stephenson', callback);
      },
      function (callback) {
        authorCreate('Veronica', 'Roth', callback);
      },
      function (callback) {
        authorCreate('Frank', 'Herbert', callback);
      },
      function (callback) {
        authorCreate('Kurt', 'Vonnegut', callback);
      },
      function (callback) {
        genreCreate('Science Fiction', callback);
      },
      function (callback) {
        genreCreate('Fantasy', callback);
      },
      function (callback) {
        genreCreate('Non-fiction', callback);
      },
    ],
    // optional callback
    cb,
  );
}

function createBooks(cb) {
  async.parallel(
    [
      function (callback) {
        bookCreate('1984', 'Summary of 1984', authors[0], [genres[0]], callback);
      },
      function (callback) {
        bookCreate('Reamde', 'Summary of Reamde.', authors[1], [genres[0]], callback);
      },
      function (callback) {
        bookCreate('Divergent', 'Summary of Divergent', authors[2], [genres[0]], callback);
      },
    ],
    // optional callback
    cb,
  );
}

function createowned(cb) {
  async.parallel(
    [
      function (callback) {
        ownedCreate(books[0], 'Owned', callback);
      },
      function (callback) {
        ownedCreate(books[1], 'Owned', callback);
      },
      function (callback) {
        ownedCreate(books[2], 'Owned', callback);
      },
    ],
    // Optional callback
    cb,
  );
}

async.series(
  [createGenreAuthors, createBooks, createowned],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('Owned: ' + owned);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  },
);
