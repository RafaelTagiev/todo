const TODOS_KEY = 'todos';

export const getFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem(TODOS_KEY)) || [];
}

export const saveToLocalStorage = (todos) => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export const getDateRepresentation = (todoCreatedDate) => {
    return Intl.DateTimeFormat("ru-RU", {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(todoCreatedDate)
}