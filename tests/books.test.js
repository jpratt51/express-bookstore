const db = require('../db');
const Book = require('../models/book');
const request = require('supertest');
const app = require('../app');

process.env.NODE_ENV = 'test';

let testBook;

describe('Test Book class', function () {
    beforeEach(async function () {
        await db.query('DELETE FROM books');
        let b = await Book.create({
            book: {
                isbn: '195900106X',
                amazon_url:
                    'https://www.amazon.com/Reaper-Cradle-Book-Will-Wight-ebook/dp/B09JS55FW3/ref=tmm_kin_swatch_0?_encoding=UTF8&qid=1679178723&sr=8-1',
                author: 'Will Wight',
                language: 'English',
                pages: 442,
                publisher: 'Hidden Gnome Publishing',
                title: 'Reaper',
                year: 2021,
            },
        });
        let b2 = await Book.create({
            book: {
                isbn: '1959001086',
                amazon_url:
                    'https://www.amazon.com/Audible-Dreadgod-Cradle-Book-11/dp/B0B3KKKR18/ref=sr_1_1?crid=3992HA8FX17ZR&keywords=dreadgod+cradle+11&qid=1679183003&sprefix=dreadgod%2Caps%2C184&sr=8-1',
                author: 'Will Wight',
                language: 'English',
                pages: 504,
                publisher: 'Hidden Gnome Publishing',
                title: 'Dreadgod',
                year: 2022,
            },
        });
        let result = await db.query(
            `SELECT * 
             FROM books 
             WHERE isbn = '195900106X'`
        );
        testBook = result.rows[0];
    });

    afterAll(async function () {
        await db.end();
    });

    test('can get book by isbn', async function () {
        let b = await Book.findOne('195900106X');
        expect(b).toEqual({
            isbn: testBook.isbn,
            amazon_url: testBook.amazon_url,
            author: testBook.author,
            language: testBook.language,
            pages: testBook.pages,
            publisher: testBook.publisher,
            title: testBook.title,
            year: testBook.year,
        });
    });

    test('can get all books', async function () {
        let b = await Book.findAll();
        expect(b).toEqual([
            {
                amazon_url:
                    'https://www.amazon.com/Audible-Dreadgod-Cradle-Book-11/dp/B0B3KKKR18/ref=sr_1_1?crid=3992HA8FX17ZR&keywords=dreadgod+cradle+11&qid=1679183003&sprefix=dreadgod%2Caps%2C184&sr=8-1',
                author: 'Will Wight',
                isbn: '1959001086',
                language: 'English',
                pages: 504,
                publisher: 'Hidden Gnome Publishing',
                title: 'Dreadgod',
                year: 2022,
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
        ]);
    });

    test('can create book', async function () {
        let b = await Book.create({
            book: {
                isbn: '1943363331',
                amazon_url:
                    'https://www.amazon.com/Unsouled-Cradle-1-Will-Wight/dp/1943363331/ref=tmm_pap_swatch_0?_encoding=UTF8&qid=1679195851&sr=1-1',
                author: 'Will Wight',
                language: 'English',
                pages: 384,
                publisher: 'Riyria Enterprises LLC',
                title: 'Unsouled',
                year: 2016,
            },
        });
        expect(b).toEqual({
            isbn: '1943363331',
            amazon_url:
                'https://www.amazon.com/Unsouled-Cradle-1-Will-Wight/dp/1943363331/ref=tmm_pap_swatch_0?_encoding=UTF8&qid=1679195851&sr=1-1',
            author: 'Will Wight',
            language: 'English',
            pages: 384,
            publisher: 'Riyria Enterprises LLC',
            title: 'Unsouled',
            year: 2016,
        });
    });

    test('can update book', async function () {
        const b = {
            book: {
                amazon_url:
                    'https://www.amazon.com/Skysworn-Cradle-Book-Will-Wight-ebook/dp/B0762YQ2H8/ref=sr_1_1?crid=10F12FRYYW95G&keywords=skysworn+will+wight&qid=1679196463&s=digital-text&sprefix=skysworn+will+wight%2Cdigital-text%2C135&sr=1-1',
                author: 'Will Wight',
                language: 'English',
                pages: 285,
                publisher: 'Hidden Gnome Publishing',
                title: 'Skysworn',
                year: '2017',
            },
        };
        const book = await Book.update('195900106X', b);
        expect(book).toEqual({
            isbn: '195900106X',
            amazon_url: b.book.amazon_url,
            author: b.book.author,
            language: b.book.language,
            pages: b.book.pages,
            publisher: b.book.publisher,
            title: b.book.title,
            year: parseInt(b.book.year),
        });
    });

    test('can remove book by isbn', async function () {
        const removed = await Book.remove('195900106X');
        let result = await db.query(
            `SELECT * 
             FROM books 
             WHERE isbn = '195900106X'`
        );
        expect(result.rows).toEqual([]);
    });
});
