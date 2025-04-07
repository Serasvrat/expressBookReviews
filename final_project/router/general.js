const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Get the book list available in the shop
public_users.get('/books-data', (req, res) => {
    res.json(books);
});

public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            'https://serasvrat-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books-data'
        );
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve books using Axios' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(
            'https://serasvrat-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books-data'
        );

        const books = response.data;
        const book = books[isbn];

        if (book) {
            res.send(book);
        } else {
            res.status(404).send({ error: 'Book not found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve book by ISBN' });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();

    try {
        const response = await axios.get(
            'https://serasvrat-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books-data'
        );

        const books = response.data;
        const matchingBooks = [];

        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author) {
                matchingBooks.push({ isbn, ...books[isbn] });
            }
        }

        if (matchingBooks.length > 0) {
            res.status(200).json(matchingBooks);
        } else {
            res.status(404).json({ message: 'No books found for this author.' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve books by author' });
    }
});


// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
    const title = req.params.title;
    const matchingBooks = [];

    try {
        const response = await axios.get(
            'https://serasvrat-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books-data'
        );

    for (let isbn in response.data) {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    }

    if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found for this title." });
    }

    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve books by title' });
    }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    
    res.send(books[isbn].reviews);
});

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    if (!username ) {
        return res.status(404).json({ message: "Username is required." });
      }
      if (!password ) {
        return res.status(404).json({ message: "password is required." });
      }
return res.status(404).json({message: "Unable to register user."});
});

module.exports.general = public_users;
