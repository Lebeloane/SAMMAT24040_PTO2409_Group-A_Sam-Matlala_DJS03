import { createBook } from './book.js'

export const createBookList = (booksData, booksPerPage) => {
    const bookList = {
        books: booksData.map(createBook),
        booksPerPage,
        currentPage: 1,
        matches: booksData.map(createBook),

        search(filters) {
            this.matches = this.books.filter(book => book.matches(filters))
            this.currentPage = 1
            return this.matches
        },

        getCurrentBookPage() {
            const start = (this.currentPage - 1) * this.booksPerPage
            const end = start + this.booksPerPage
            return this.matches.slice(start, end)
        },

        remainingCount() {
            return Math.max(0, this.matches.length - (this.currentPage * this.booksPerPage))
        },

        nextPage() {
            if (this.remainingCount() > 0) {
                this.currentPage++
                return true
            }
            return false
        }
    }
    return bookList
}
