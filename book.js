import { authors } from './data.js'

export const createBook = ({ id, title, author, image, description, published, genres }) => {
    const book = {
        id,
        title,
        author,
        image,
        description,
        published: new Date(published),
        genres,

        matches(filters) {
            const titleMatch = !filters.title.trim() || this.title.toLowerCase().includes(filters.title.toLowerCase())
            const authorMatch = filters.author === 'any' || this.author === filters.author
            let genreMatch = filters.genre === 'any'
            for (const singleGenre of this.genres) {
                if (genreMatch) break;
                if (singleGenre === filters.genre) genreMatch = true
            }
            return titleMatch && authorMatch && genreMatch
        },

        previewElement() {
            const btnElement = document.createElement('button')
            btnElement.classList = 'preview'
            btnElement.setAttribute('data-preview', this.id)
            btnElement.innerHTML = `
                <img class="preview__image" src="${this.image}" />
                <div class="preview__info">
                    <h3 class="preview__title">${this.title}</h3>
                    <div class="preview__author">${authors[this.author]}</div>
                </div>
            `
            return btnElement
        }
    }
    return book
}
