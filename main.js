import { books, BOOKS_PER_PAGE } from './data.js'
import { createBookList } from './bookList.js'
import { createBookUI } from './bookUI.js'



const bookList = createBookList(books, BOOKS_PER_PAGE)
createBookUI(bookList)
