import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

// Book object creation remains the same


/**
    *  Creating a new book instance
    * @param {Object} bookData - book data from data.js
    * @param {string} bookData.id - Unique identifier for the book.
    * @param {string} bookData.title - The title of the book.
    * @param {string} bookData.author - The identifier for the book's author.
    * @param {string} bookData.image - URL of the book's cover image.
    * @param {string} bookData.description - Short description or summary of the book.
    * @param {string} bookData.published - Publication date of the book.
    * @param {string[]} bookData.genres - Array of genre identifiers for the book.
    * @returns {Object} A Book object with `matches` and `previewElement` methods.
 */
const createBook = ({ id, title, author, image, description, published, genres }) => {
    /**
     * Book object with properties and methods for interacting with book data.
     * @type {Object}
     */
    const book = {
        id, 
        title,
        author,
        image,
        description,
        published: new Date(published),
        genres,

        /**
         * Determines if the book matches the given search filters based on title, author, and genre.
         * 
         * @param {Object} filters - Object with filter criteria.
         * @param {string} filters.title - Partial or full text to match in the book's title (case-insensitive).
         * @param {string} filters.author - Author identifier or 'any' to match any author.
         * @param {string} filters.genre - Genre identifier or 'any' to match any genre.
         * @returns {boolean} - Returns `true` if the book matches all filter criteria; `false` otherwise.
         */
        matches(filters) {
            // Checks if the title filter is empty or if the book's title includes the filter text (case-insensitive)
            const titleMatch = !filters.title.trim() || this.title.toLowerCase().includes(filters.title.toLowerCase())

            // Matches any author if 'any' is selected, or checks if the book's author matches the filter
            const authorMatch = filters.author === 'any' || this.author === filters.author
            
            // Matches any genre if 'any' is selected, or checks if the book's genres include the filter genre
            let genreMatch = filters.genre === 'any'
            for (const singleGenre of this.genres) {
                if (genreMatch) break;
                if (singleGenre === filters.genre) { genreMatch = true }
            }

            // Returns true only if the book meets all filter criteria (title, author, genre)
            return titleMatch && authorMatch && genreMatch
        },


        /**
         * Creates and returns a DOM button element to display a preview of the book.
         * 
         * @returns {HTMLElement} - A button element containing the book's preview, including title, image, and author.
         */
        previewElement() {
            const btnElement = document.createElement('button')
            btnElement.classList = 'preview'
            btnElement.setAttribute('data-preview', this.id) // Sets a data attribute for easy identification

            // Sets inner HTML of button to display book image, title, and author
            btnElement.innerHTML = `
                <img
                    class="preview__image"
                    src="${this.image}"
                />
                
                <div class="preview__info">
                    <h3 class="preview__title">${this.title}</h3>
                    <div class="preview__author">${authors[this.author]}</div>
                </div>
            `
            // Returns the complete button element to be used in the DOM
            return btnElement
        }
    }
    return book // Returns the newly created Book object
}


// BookList Object for managing collection of books and methods


const createBookList = (booksData, booksPerPage) => {
    /**
     * Creates a new BookList instance
     * @param {Array} booksData - Array of raw book data
     * @param {number} booksPerPage - Number of books to display per page
     * @returns {Object} A booklist object with methods to filter, navigate and retrieve books
     */
    const bookList = {
        // convert raw book data into book instances
        books: booksData.map(createBook),
        booksPerPage, // Store books per page setting
        // Initialize current page to 1
        currentPage: 1,
        // all books are matches initially
        matches: booksData.map(createBook),

        /**
         * Resets to the first page and returns the filtered matches.
         * @param {Object} filters - Search include a the title, author, or genre
         * @returns {Array<Object>} An array of books that match the specified filters
         */
        search(filters) {
            this.matches = this.books.filter(book => book.matches(filters))
            this.currentPage = 1
            return this.matches
        },

        /**
         * gets books for the current page based on 'booksPerPage'.
         * This method slices the 'matches' array to return  books for the current page
         * @returns {Array<Object>} An array of books for the current page
         */
        getCurrentBookPage() {
            // Calculate the start and end indexes for slicing 'matches'
            const start = (this.currentPage - 1) * this.booksPerPage
            const end = start + this.booksPerPage
            return this.matches.slice(start, end)
        },

        /**
         * Calculates the number of books remaining after the current page
         * @returns {number} The count of remaining books after the current page
         */
        remainingCount() {
            // Calculate remaining books by subtracting books shown from total matches
            return Math.max(0, this.matches.length - (this.currentPage * this.booksPerPage))
        },

        /**
         * goes to the next page of results if additional books are available.
         * @returns {boolean} true if the page goes successfully, false if no more pages are available
         */
        nextPage() {
            // move to the next page only if there are remaining books to display
            if (this.remainingCount() > 0) {
                this.currentPage++
                return true
            }
            return false
        }
    }
    return bookList // returns the bookList object
}


// Creating the book ui which handles all user interface interactions

const createBookUI = (bookList) => {
    const bookUI = {
        bookList,

        /**
        * Initializes all UI components
        */
        initializeUI() {
            // Render initial set of books
            this.renderBooks()
            // Set up theme based on system preference
            this.setupTheme()
            // Populate genre and author dropdowns
            this.populateDropdowns()
            // Update "Show More" button state
            this.updateShowMoreButton()
        },

        /**
         * Sets up all event listeners for the application
         */
        setupEventListeners() {
            // Search form submission
            document.querySelector('[data-search-form]').addEventListener('submit', 
                (event) => this.handleSearch(event))
            
            // Search cancel button
            document.querySelector('[data-search-cancel]').addEventListener('click', 
                () => this.toggleOverlay('search', false))
            
            // Search button in header
            document.querySelector('[data-header-search]').addEventListener('click', 
                () => this.toggleOverlay('search', true))

            // Settings form submission
            document.querySelector('[data-settings-form]').addEventListener('submit', 
                (event) => this.handleThemeUpdate(event))
            
            // Settings cancel button
            document.querySelector('[data-settings-cancel]').addEventListener('click', 
                () => this.toggleOverlay('settings', false))
            
            // Settings button in header
            document.querySelector('[data-header-settings]').addEventListener('click', 
                () => this.toggleOverlay('settings', true))

            // Show more button
            document.querySelector('[data-list-button]').addEventListener('click', 
                () => this.loadMoreBooks())
            
            // Book list click delegation
            document.querySelector('[data-list-items]').addEventListener('click', 
                (event) => this.handleBookClick(event))
            
            // Close book details
            document.querySelector('[data-list-close]').addEventListener('click', 
                () => document.querySelector('[data-list-active]').open = false)
        },

        /**
         * Renders books to the page
         * @param {Array} books - Optional specific books to render
         */
        renderBooks(books = this.bookList.getCurrentBookPage()) {
            // Create document fragment for better performance
            const fragment = document.createDocumentFragment()
            // Add each book's preview element to fragment
            books.forEach(book => fragment.appendChild(book.previewElement()))

            // Get container element
            const container = document.querySelector('[data-list-items]')
            // Clear container if on first page
            if (this.bookList.currentPage === 1) container.innerHTML = ''
            // Append fragment to container
            container.appendChild(fragment)
        },

        /**
        * Sets up theme based on system preference
        */
        setupTheme() {
            // Check system dark mode preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            // Set theme value based on preference
            const theme = isDark ? 'night' : 'day'
            // Update theme selector value
            document.querySelector('[data-settings-theme]').value = theme
            // Apply theme to page
            this.applyTheme(theme)
        },

        /**
         * Applies theme to document
        * @param {string} theme - Theme name ('day' or 'night')
        */
        applyTheme(theme) {
            // Get root element for CSS variables
            const root = document.documentElement
            // Set dark color based on theme 
            const darkColor = theme === 'night' ? '255, 255, 255' : '10, 10, 20'
            // Set light color based on theme
            const lightColor = theme === 'night' ? '10, 10, 20' : '255, 255, 255'
            // Apply colors to CSS variables
            root.style.setProperty('--color-dark', darkColor)
            root.style.setProperty('--color-light', lightColor)
        },

        /**
         * Populates dropdown menus
         */
        populateDropdowns() {
            // Populate genres dropdown
            this.populateSelect('[data-search-genres]', genres, 'All Genres')
            // Populate authors dropdown
            this.populateSelect('[data-search-authors]', authors, 'All Authors')
        },


        /**
         * Populates a select element with options
         * @param {string} selector - CSS selector for select element
         * @param {Object} options - Options to populate
         * @param {string} defaultText - Text for default option
         */
        populateSelect(selector, options, defaultText) {
            // Create fragment for better performance 
            const fragment = document.createDocumentFragment()
            
            // Create default option
            const defaultOption = document.createElement('option')
            defaultOption.value = 'any'
            defaultOption.innerText = defaultText
            fragment.appendChild(defaultOption)
    
            // Create option for each item
            for (const [id, name] of Object.entries(options)) {
                const element = document.createElement('option')
                element.value = id
                element.innerText = name
                fragment.appendChild(element)
            }
    
            // Append all options to select element
            document.querySelector(selector).appendChild(fragment)
        },

        /**
         * Updates "Show More" button state and text
         */
        updateShowMoreButton() {
            // Get remaining books count
            const remaining = this.bookList.remainingCount()
            // Get button element
            const button = document.querySelector('[data-list-button]')
            // Disable button if no remaining books
            button.disabled = remaining <= 0

            // Update button text with remaining count
            button.innerHTML = `
                <span>Show more</span>
                <span class="list__remaining"> (${remaining})</span>
            `
        },


        /**
         * Handles search form submission
         * @param {Event} event - Submit event
         */
        handleSearch(event) {
            event.preventDefault() // Prevent form submission
            const formData = new FormData(event.target) // Get form data
            const filters = Object.fromEntries(formData) // Convert form data to object
            
            const results = this.bookList.search(filters) // Search books with filters
            this.renderBooks() // Render filtered results
            
            // Toggle "no results" message
            document.querySelector('[data-list-message]').classList.toggle(
                'list__message_show', 
                results.length < 1
            )
            
            // Update UI elements
            this.updateShowMoreButton()
            this.toggleOverlay('search', false)
            // Scroll to top of results
            window.scrollTo({top: 0, behavior: 'smooth'})
        },


        /**
         * Handles theme update form submission
         * @param {Event} event - Submit event
         */
        handleThemeUpdate(event) {
            event.preventDefault() // Prevent form submission
            const formData = new FormData(event.target) // Get form data
            const { theme } = Object.fromEntries(formData) // Get theme from form data
            this.applyTheme(theme) // Apply new theme
            this.toggleOverlay('settings', false) // Close settings overlay
        },

        /**
         * Handles clicks on book previews
         * @param {Event} event - Click event
         */
        handleBookClick(event) {
            // Get path to clicked element
            const pathArray = Array.from(event.path || event.composedPath())
            let active = null

            for (const node of pathArray) {
                if (active) break
                if (node?.dataset?.preview) {
                    active = this.bookList.books.find(book => book.id === node.dataset.preview)
                }
            }
            
            if (active) this.showBookDetails(active)
        },


        /**
         * Displays book details overlay
         * @param {Book} book - Book to display
         */
        showBookDetails(book) {
            document.querySelector('[data-list-active]').open = true
            document.querySelector('[data-list-blur]').src = book.image
            document.querySelector('[data-list-image]').src = book.image
            document.querySelector('[data-list-title]').innerText = book.title
            document.querySelector('[data-list-subtitle]').innerText = 
                `${authors[book.author]} (${book.published.getFullYear()})`
            document.querySelector('[data-list-description]').innerText = book.description
        },


        /**
         * Loads more books when "Show More" is clicked
         */
        loadMoreBooks() {
            if (this.bookList.nextPage()) {
                this.renderBooks()
                this.updateShowMoreButton()
            }
        },


        /**
         * Toggles visibility of overlay elements
         * @param {string} name - Overlay name
         * @param {boolean} show - Whether to show or hide
         */
        toggleOverlay(name, show) {
            document.querySelector(`[data-${name}-overlay]`).open = show
            if (show && name === 'search') {
                document.querySelector('[data-search-title]').focus()
            }
        }
    }
    
    bookUI.setupEventListeners()
    bookUI.initializeUI()
    return bookUI
}
