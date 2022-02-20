const Owned = require('../models/owned');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');

// Display list of all Owned books.
exports.owned_list = (req, res, next) => {
  Owned.find()
    .populate('book')
    .exec(function (err, list_owned) {
      if (err) {
        return next(err);
      }
      res.render('owned_list', {
        title: 'Owned Book List',
        owned_list: list_owned,
      });
    });
};

// Display detail page for a specific owned book
exports.owned_detail = (req, res, next) => {
  Owned.findById(req.params.id)
    .populate('book')
    .exec(function (err, owned) {
      if (err) {
        return next(err);
      }
      if (owned == null) {
        const err = new Error('Book not found');
        err.status = 404;
        return next(err);
      }
      res.render('owned_detail', {
        title: `Book: ${owned.book.title}`,
        owned: owned,
      });
    });
};

// Display owned create form on GET.
exports.owned_create_get = (req, res, next) => {
  Book.find({}, 'title').exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render('owned_form', { title: 'Create owned', book_list: books });
  });
};

// Handle owned create on POST.
// Handle owned create on POST.
exports.owned_create_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a owned object with escaped and trimmed data.
    let owned = new Owned({ book: req.body.book, status: req.body.status });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render('owned_form', {
          title: 'Create Owned Book',
          book_list: books,
          selected_book: owned.book._id,
          errors: errors.array(),
          owned: owned,
        });
      });
      return;
    } else {
      // Data from form is valid.
      owned.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(owned.url);
      });
    }
  },
];

// Display Owned delete form on GET.
exports.owned_delete_get = (req, res, next) => {
  Owned.findById(req.params.id)
    .populate('book')
    .exec(function (err, owned) {
      if (err) {
        return next(err);
      }
      if (owned == null) {
        res.redirect('/catalog/owned');
      }
      res.render('owned_delete', {
        title: 'Delete Owned Book',
        owned: owned,
      });
    });
};

// Handle Owned delete on POST.
exports.owned_delete_post = (req, res, next) => {
  Owned.findByIdAndRemove(req.body.ownedid, function deleteOwned(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/catalog/owned');
  });
};

// TODO (maybe) do more with owned books
// Right now only add if actually owned, remove if not owned
// // Display Owned update form on GET.
exports.owned_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Owned update GET');
};

// // Handle Owned update on POST.
exports.owned_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Owned update POST');
};
