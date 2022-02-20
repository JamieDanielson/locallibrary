# local library site

cribbed from [MDN Local Library Tutorial](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Tutorial_local_library_website) with some minor modifications

## to run

- run `npm install`
- add `MONGODB_URI` to `.env` file (setup MongoDB to get connection string)
- run `populatedb.js` to populate db with some starter data
- run `npm start` (or `npm run debug` for nodemon and console logging)
- navigate to <http://localhost:3000>

### built with

- nodejs/express
- mongo/mongoose
- bootstrap

### Schemas

```js
const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
});

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  summary: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
});

const GenreSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
});

const OwnedSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
  status: {
    type: String,
    required: true,
    enum: ['Owned', 'Not Owned'],
    default: 'Not Owned',
  },
});
```
