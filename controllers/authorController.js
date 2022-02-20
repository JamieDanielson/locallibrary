const async = require('async');
const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// Display list of all Authors.
exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['last_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) {
        return next(err);
      }
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: req.params.id }, 'title summary').exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.author == null) {
        const err = new Error('Author not found');
        err.status = 404;
        return next(err);
      }
      res.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.authors_books,
      });
    },
  );
};

// Display Author create form on GET.
exports.author_create_get = (req, res) => {
  res.render('author_form', {
    title: 'Create Author',
  });
};

// Handle Author create on POST.
exports.author_create_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified.')
    .isAlphanumeric()
    .withMessage('Last name has non-alphanumeric characters.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      const author = new Author({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      });
      author.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(author.url);
      });
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.author == null) {
        // No results.
        res.redirect('/catalog/authors');
      }
      // Successful, so render.
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        author_books: results.authors_books,
      });
    },
  );
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.authors_books.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render('author_delete', {
          title: 'Delete Author',
          author: results.author,
          author_books: results.authors_books,
        });
        return;
      } else {
        // Author has no books. Delete object and redirect to the list of authors.
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) {
            return next(err);
          }
          // Success - go to author list
          res.redirect('/catalog/authors');
        });
      }
    },
  );
};

// Display Author update form on GET.
exports.author_update_get = (req, res, next) => {
  Author.findById(req.params.id, function (err, author) {
    if (err) {
      return next(err);
    }
    if (author == null) {
      let err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    res.render('author_form', {
      title: 'Update Author',
      author: author,
    });
  });
};

// Handle Author update on POST.
exports.author_update_post = [
  body('first_name', 'First name must be specified.')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('last_name', 'Last name must be specified.')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isAlphanumeric()
    .withMessage('Last name has non-alphanumeric characters.'),
  (req, res, next) => {
    const errors = validationResult(req);
    // Create an author object with escaped/trimmed data and old id
    const author = new Author({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Update Author',
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
        if (err) {
          return next(err);
        }
        res.redirect(theauthor.url);
      });
    }
  },
];
