const db = require('../db');
const Book = require('../models/book');
const request = require('supertest');
const app = require('../app');

process.env.NODE_ENV = 'test';

let testBook;
let testBook2;

beforeEach(async () => {
    const book = await db.query(
        `INSERT INTO books (
            isbn, 
            amazon_url, 
            author, 
            language, 
            pages, 
            publisher, 
            title, 
            year) 
        VALUES (
            '195900106X', 
            'https://www.amazon.com/Reaper-Cradle-Book-Will-Wight-ebook/dp/B09JS55FW3/ref=tmm_kin_swatch_0?_encoding=UTF8&qid=1679178723&sr=8-1', 
            'Will Wight', 
            'English', 
            442, 
            'Hidden Gnome Publishing', 
            'Reaper', 
            2021) 
        RETURNING 
            isbn, 
            amazon_url, 
            author, 
            language, 
            pages, 
            publisher, 
            title, year`
    );
    const book2 = await db.query(
        `INSERT INTO books (
            isbn, 
            amazon_url, 
            author, 
            language, 
            pages, 
            publisher, 
            title, 
            year) 
        VALUES (
            '1959001086', 
            'https://www.amazon.com/Audible-Dreadgod-Cradle-Book-11/dp/B0B3KKKR18/ref=sr_1_1?crid=3992HA8FX17ZR&keywords=dreadgod+cradle+11&    qid=1679183003&sprefix=dreadgod%2Caps%2C184&sr=8-1', 
            'Will Wight', 
            'English', 
            504, 
            'Hidden Gnome Publishing', 
            'Dreadgod', 
        2022) 
            RETURNING 
            isbn, 
            amazon_url, 
            author, 
            language, 
            pages, 
            publisher, 
            title, 
            year`
    );
    testBook = book.rows[0];
    testBook2 = book2.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM books`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /books', () => {
    test('Can get all books', async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            books: [
                {
                    isbn: testBook2.isbn,
                    amazon_url: testBook2.amazon_url,
                    author: testBook2.author,
                    language: testBook2.language,
                    pages: testBook2.pages,
                    publisher: testBook2.publisher,
                    title: testBook2.title,
                    year: testBook2.year,
                },
                {
                    isbn: testBook.isbn,
                    amazon_url: testBook.amazon_url,
                    author: testBook.author,
                    language: testBook.language,
                    pages: testBook.pages,
                    publisher: testBook.publisher,
                    title: testBook.title,
                    year: testBook.year,
                },
            ],
        });
    });
});

describe('GET /books/:id', () => {
    test('Get book by isbn', async () => {
        const res = await request(app).get(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            book: {
                isbn: testBook.isbn,
                amazon_url: testBook.amazon_url,
                author: testBook.author,
                language: testBook.language,
                pages: testBook.pages,
                publisher: testBook.publisher,
                title: testBook.title,
                year: testBook.year,
            },
        });
    });
    test('Responds with 404 for invalid isbn', async () => {
        const res = await request(app).get(`/books/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe('POST /books', () => {
    test('Creates a single book', async () => {
        const res = await request(app)
            .post('/books')
            .send({
                book: {
                    isbn: '1959001019',
                    amazon_url:
                        'https://www.amazon.com/Skysworn-Cradle-Book-Will-Wight-ebook/dp/B0762YQ2H8/ref=sr_1_1?crid=10F12FRYYW95G&keywords=skysworn+will+wight&qid=1679196463&s=digital-text&sprefix=skysworn+will+wight%2Cdigital-text%2C135&sr=1-1',
                    author: 'Will Wight',
                    language: 'English',
                    pages: 285,
                    publisher: 'Hidden Gnome Publishing',
                    title: 'Skysworn',
                    year: 2017,
                },
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            book: {
                isbn: '1959001019',
                amazon_url:
                    'https://www.amazon.com/Skysworn-Cradle-Book-Will-Wight-ebook/dp/B0762YQ2H8/ref=sr_1_1?crid=10F12FRYYW95G&keywords=skysworn+will+wight&qid=1679196463&s=digital-text&sprefix=skysworn+will+wight%2Cdigital-text%2C135&sr=1-1',
                author: 'Will Wight',
                language: 'English',
                pages: 285,
                publisher: 'Hidden Gnome Publishing',
                title: 'Skysworn',
                year: 2017,
            },
        });
    });

    test('Responds with 404 for invalid entry', async () => {
        const res = await request(app).post(`/books`).send({
            isbn: 'apple',
        });
        expect(res.statusCode).toBe(400);
    });
});

describe('PUT /books/:isbn', () => {
    test('Updates a single book', async () => {
        const res = await request(app)
            .put(`/books/${testBook.isbn}`)
            .send({
                book: {
                    amazon_url:
                        'https://www.amazon.com/Skysworn-Cradle-Book-Will-Wight-ebook/dp/B0762YQ2H8/ref=sr_1_1?crid=10F12FRYYW95G&keywords=skysworn+will+wight&qid=1679196463&s=digital-text&sprefix=skysworn+will+wight%2Cdigital-text%2C135&sr=1-1',
                    author: 'Will Wight',
                    language: 'English',
                    pages: 285,
                    publisher: 'Hidden Gnome Publishing',
                    title: 'Skysworn',
                    year: 2017,
                },
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            book: {
                isbn: '195900106X',
                amazon_url:
                    'https://www.amazon.com/Skysworn-Cradle-Book-Will-Wight-ebook/dp/B0762YQ2H8/ref=sr_1_1?crid=10F12FRYYW95G&keywords=skysworn+will+wight&qid=1679196463&s=digital-text&sprefix=skysworn+will+wight%2Cdigital-text%2C135&sr=1-1',
                author: 'Will Wight',
                language: 'English',
                pages: 285,
                publisher: 'Hidden Gnome Publishing',
                title: 'Skysworn',
                year: 2017,
            },
        });
    });
    test('Responds with 404 for invalid isbn', async () => {
        const res = await request(app)
            .put(`/books/0`)
            .send({
                book: {
                    amazon_url:
                        'https://www.amazon.com/Skysworn-Cradle-Book-Will-Wight-ebook/dp/B0762YQ2H8/ref=sr_1_1?crid=10F12FRYYW95G&keywords=skysworn+will+wight&qid=1679196463&s=digital-text&sprefix=skysworn+will+wight%2Cdigital-text%2C135&sr=1-1',
                    author: 'Will Wight',
                    language: 'English',
                    pages: 285,
                    publisher: 'Hidden Gnome Publishing',
                    title: 'Skysworn',
                    year: 2017,
                },
            });
        expect(res.statusCode).toBe(404);
    });
});

describe('DELETE /books/:isbn', () => {
    test('Deletes a single book', async () => {
        const res = await request(app).delete(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Book deleted' });
    });
});
