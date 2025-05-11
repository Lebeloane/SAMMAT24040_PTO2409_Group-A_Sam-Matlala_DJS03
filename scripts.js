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


document.querySelector('[data-list-items]').appendChild(starting)

const genreHtml = document.createDocumentFragment()
const firstGenreElement = document.createElement('option')
firstGenreElement.value = 'any'
firstGenreElement.innerText = 'All Genres'
genreHtml.appendChild(firstGenreElement)

for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    genreHtml.appendChild(element)
}

document.querySelector('[data-search-genres]').appendChild(genreHtml)

const authorsHtml = document.createDocumentFragment()
const firstAuthorElement = document.createElement('option')
firstAuthorElement.value = 'any'
firstAuthorElement.innerText = 'All Authors'
authorsHtml.appendChild(firstAuthorElement)

for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    authorsHtml.appendChild(element)
}

document.querySelector('[data-search-authors]').appendChild(authorsHtml)

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}

document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})