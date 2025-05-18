import { authors, genres } from './data.js'

export const createBookUI = (bookList) => {
    const bookUI = {
        bookList,

        initializeUI() {
            this.renderBooks()
            this.setupTheme()
            this.populateDropdowns()
            this.updateShowMoreButton()
        },

        setupEventListeners() {
            document.querySelector('[data-search-form]').addEventListener('submit', (e) => this.handleSearch(e))
            document.querySelector('[data-search-cancel]').addEventListener('click', () => this.toggleOverlay('search', false))
            document.querySelector('[data-header-search]').addEventListener('click', () => this.toggleOverlay('search', true))
            document.querySelector('[data-settings-form]').addEventListener('submit', (e) => this.handleThemeUpdate(e))
            document.querySelector('[data-settings-cancel]').addEventListener('click', () => this.toggleOverlay('settings', false))
            document.querySelector('[data-header-settings]').addEventListener('click', () => this.toggleOverlay('settings', true))
            document.querySelector('[data-list-button]').addEventListener('click', () => this.loadMoreBooks())
            document.querySelector('[data-list-items]').addEventListener('click', (e) => this.handleBookClick(e))
            document.querySelector('[data-list-close]').addEventListener('click', () => document.querySelector('[data-list-active]').open = false)
        },

        renderBooks(books = this.bookList.getCurrentBookPage()) {
            const fragment = document.createDocumentFragment()
            books.forEach(book => fragment.appendChild(book.previewElement()))
            const container = document.querySelector('[data-list-items]')
            if (this.bookList.currentPage === 1) container.innerHTML = ''
            container.appendChild(fragment)
        },

        setupTheme() {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const theme = isDark ? 'night' : 'day'
            document.querySelector('[data-settings-theme]').value = theme
            this.applyTheme(theme)
        },

        applyTheme(theme) {
            const root = document.documentElement
            const darkColor = theme === 'night' ? '255, 255, 255' : '10, 10, 20'
            const lightColor = theme === 'night' ? '10, 10, 20' : '255, 255, 255'
            root.style.setProperty('--color-dark', darkColor)
            root.style.setProperty('--color-light', lightColor)
        },

        populateDropdowns() {
            this.populateSelect('[data-search-genres]', genres, 'All Genres')
            this.populateSelect('[data-search-authors]', authors, 'All Authors')
        },

        populateSelect(selector, options, defaultText) {
            const fragment = document.createDocumentFragment()
            const defaultOption = document.createElement('option')
            defaultOption.value = 'any'
            defaultOption.innerText = defaultText
            fragment.appendChild(defaultOption)

            for (const [id, name] of Object.entries(options)) {
                const element = document.createElement('option')
                element.value = id
                element.innerText = name
                fragment.appendChild(element)
            }

            document.querySelector(selector).appendChild(fragment)
        },

        updateShowMoreButton() {
            const remaining = this.bookList.remainingCount()
            const button = document.querySelector('[data-list-button]')
            button.disabled = remaining <= 0
            button.innerHTML = `
                <span>Show more</span>
                <span class="list__remaining"> (${remaining})</span>
            `
        },

        handleSearch(event) {
            event.preventDefault()
            const formData = new FormData(event.target)
            const filters = Object.fromEntries(formData)
            const results = this.bookList.search(filters)
            this.renderBooks()
            document.querySelector('[data-list-message]').classList.toggle('list__message_show', results.length < 1)
            this.updateShowMoreButton()
            this.toggleOverlay('search', false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        handleThemeUpdate(event) {
            event.preventDefault()
            const formData = new FormData(event.target)
            const { theme } = Object.fromEntries(formData)
            this.applyTheme(theme)
            this.toggleOverlay('settings', false)
        },

        handleBookClick(event) {
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

        showBookDetails(book) {
            document.querySelector('[data-list-active]').open = true
            document.querySelector('[data-list-blur]').src = book.image
            document.querySelector('[data-list-image]').src = book.image
            document.querySelector('[data-list-title]').innerText = book.title
            document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${book.published.getFullYear()})`
            document.querySelector('[data-list-description]').innerText = book.description
        },

        loadMoreBooks() {
            if (this.bookList.nextPage()) {
                this.renderBooks()
                this.updateShowMoreButton()
            }
        },

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
