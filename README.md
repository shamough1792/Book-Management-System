# Project Name: Book Management System

## Project File Introduction
- **server.js:** Implements the server functionalities, including user authentication, CRUD operations for books, and RESTful APIs.
- **package.json:** Lists the dependencies used in the project.
- **public:** Contains static files such as CSS, images, etc.
- **views:** Contains EJS templates for rendering the UI.
- **models:** Contains Mongoose model files for MongoDB schemas.

## Operation Guides

### Login/Logout
- **Valid login information:**
  - **Username:** `root`
  - **Password:** `test12345`
  
- **Steps to log in:**
  1. Navigate to the homepage.
  2. Enter the username and password.
  3. Click the login button.

## CRUD Operations
- **Create:** Use the form at the top of the book list to add a new book.
- **Read:** View the list of books displayed on the page.
- **Update:** Edit book details using the input fields within each book card.
- **Delete:** Click the "Delete" button under each book to remove it.

### Reading History
- **Functionality:** Users can view their reading history.
- **Operation:** Select "Reading History" from the main menu to see all books marked as read.

### Favorites
- **Functionality:** Users can mark their favorite books for easy access.
- **Operation:** Click the "Favorite" or "Unfavorite" button under each book to manage favorites.

### Language Switching
- **Functionality:** Users can switch between different languages to suit their needs.
- **Operation:** Find the language switch button in the interface, select the desired language, and the interface will update accordingly.

### RESTful CRUD Services
- **Read:** `GET /api/books`
- **Create:** `POST /api/books`
- **Update:** `PUT /api/books/:id`
- **Delete:** `DELETE /api/books/:id`

### CURL Testing Commands
- **Get all books:** 
  ```bash
  curl -X GET https://381project-group1.render.com/api/books

### Add a book:
curl -X POST https://381project-group1.render.com/api/books -d '{"title":"New Book","author":"Author Name","description":"Description","cover":"URL"}' -H "Content-Type: application/json"

### Update a book:
curl -X PUT https://381project-group1.render.com/api/books/<id> -d '{"title":"Updated Title","author":"Updated Author","description":"Updated Description","cover":"Updated URL"}' -H "Content-Type: application/json"

### Delete a book:
curl -X DELETE https://381project-group1.render.com/api/books/<id>

// RESTful API for Books
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

app.post('/api/books', async (req, res) => {
    const { title, author, description, cover } = req.body;
    const newBook = new Book({ title, author, description, cover });
    await newBook.save();
    res.status(201).json(newBook);
});

app.put('/api/books/:id', async (req, res) => {
    const { title, author, description, cover } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, { title, author, description, cover }, { new: true });
    res.json(updatedBook);
});

app.delete('/api/books/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.status(204).send();
});


