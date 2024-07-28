const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

///Functions
function doesExist(username) {
  return users.some(user => user.username === username);
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Function to get the list of books using async-await
async function getBooksUsingAsyncAwait() {
  try {
    const response = await axios.get('http://localhost:8000/api/books');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const books = await getBooksUsingAsyncAwait();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Function to get book details by author using async-await
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:8000/api/books?author=${author}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const books = await getBooksByAuthor(author);
    if (books.length > 0) {
      res.json(books);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Function to get book details by title using async-await
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:8000/api/books?title=${title}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get book details based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const books = await getBooksByTitle(title);
    if (books.length > 0) {
      res.json(books);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

// Get book details based on ISBN using Promises
function getBookDetailsByISBN(isbn) {
  return axios.get(`http://localhost:8000/api/books/${isbn}`)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getBookDetailsByISBN(isbn)
    .then(book => {
      res.json(book);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book details", error: error.message });
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
