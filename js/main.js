import { getFromLocalStorage, saveToLocalStorage, getDateRepresentation } from "../js/utils.js";

const log = console.log;
const dir = console.dir;

const addTodoInput = document.querySelector('[data-text-field]');
const addTodoBtn = document.querySelector('[data-todo-btn]');
const searchTodoInput = document.querySelector('[data-search-field]');
const todoContainer = document.querySelector('[data-todo-list]');
const todoTemplate = document.querySelector('[data-todo-template]');
const todoCount = document.querySelector('[data-todo-count]');
const removeTodoAllBtn = document.querySelector('[data-remove-all]')

let todoList = getFromLocalStorage();
let filteredTodoList = [];

addTodoBtn.addEventListener('click', () => {
    if (addTodoInput.value.trim()) {
        const newTodo = {
            id: Date.now(),
            text: addTodoInput.value.trim(),
            completed: false,
            createdAt: getDateRepresentation(new Date()),
        };
        todoList.push(newTodo);
        addTodoInput.value = '';
        searchTodoInput.value = '';

    };

    saveToLocalStorage(todoList);
    render()
});

addTodoInput.addEventListener('input', () => {
    if (searchTodoInput.value.trim()) {
        searchTodoInput.value = '';

        render();
    }
})

searchTodoInput.addEventListener('input', (e) => {
    const searchValue = e.target.value.trim();

    filterAndRenderFilteredTodos(searchValue);
})

removeTodoAllBtn.addEventListener('click', () => {
    getCompletedTodos((a, b) => a > b);
})

const filterAndRenderFilteredTodos = (searchValue) => {
    filteredTodoList = todoList.filter((t) => {
        return t.text.includes(searchValue);
    });

    renderFiltered();
}

const getCompletedTodos = (comparator) => {
    if (comparator(0, 1)) {
        let i = 0;
        todoList.forEach((t) => {
            if (t.completed === true) {
                i++;
            }
        })

        return i;
    } else {
        todoList = todoList.filter((t) => {
            if (t.completed !== true) {
                return t;
            }
        })

        saveToLocalStorage(todoList);

        if (searchTodoInput.value.trim()) {
            filterAndRenderFilteredTodos(searchTodoInput.value.trim());

        } else {
            render();
        }
    }
}

const createTodoLayout = (todo) => {
    const todoElement = document.importNode(todoTemplate.content, true);

    const checkBox = todoElement.querySelector('[data-todo-list-checkbox]');
    checkBox.checked = todo.completed;

    const todoInfo = todoElement.querySelector('[data-todo-info]');
    if (todo.completed === true) {
        todoInfo.classList.value += ' todo__item-info--checked';
    } else {
        todoInfo.classList.remove = 'todo__item-info--checked';
    }

    const todoText = todoElement.querySelector('[data-todo-text]');
    todoText.textContent = todo.text;

    const todoCreatedDate = todoElement.querySelector('[data-todo-date]');
    todoCreatedDate.textContent = todo.createdAt;

    const removeTodoBtn = todoElement.querySelector('[data-todo-remove-btn]');
    removeTodoBtn.disabled = !todo.completed;

    const editTodoBtn = todoElement.querySelector('[data-todo-edit-btn]');

    checkBox.addEventListener('change', (e) => {
        todoList = todoList.map((t) => {
            if (t.id === todo.id) {
                t.completed = e.target.checked;
            }
            return t;
        });

        saveToLocalStorage(todoList);

        if (searchTodoInput.value.trim()) {
            filterAndRenderFilteredTodos(searchTodoInput.value.trim());

        } else {
            render();
        }
    });

    editTodoBtn.addEventListener('click', (e) => {
        todoList = todoList.map((t) => {
            if (t.id === todo.id) {
                const editedText = prompt('edit todo').trim();
                if(editedText) {
                    t.text = editedText;
                    t.completed = e.target.checked;
                }
            }
            return t;
        });

        saveToLocalStorage(todoList);

        if (searchTodoInput.value.trim()) {
            filterAndRenderFilteredTodos(searchTodoInput.value.trim());

        } else {
            render();
        }
    })

    removeTodoBtn.addEventListener('click', () => {
        todoList = todoList.filter((t) => {
            if (t.id !== todo.id) {
                return t;
            };
        })

        saveToLocalStorage(todoList);

        if (searchTodoInput.value.trim()) {
            filterAndRenderFilteredTodos(searchTodoInput.value.trim());

        } else {
            render();
        }
    });

    return todoElement;
}

const render = () => {
    todoContainer.innerHTML = '';
    
    todoCount.textContent = `${getCompletedTodos((a, b) => a < b)} items completed`

    if (todoList.length === 0) {
        todoContainer.innerHTML = '<h3>No todos...</h3>';
        return;
    }

    todoList.forEach((todo) => {
        const todoElement = createTodoLayout(todo);

        todoContainer.append(todoElement);
    })
    
};

const renderFiltered = () => {
    todoContainer.innerHTML = '';

    if (filteredTodoList.length === 0) {
        todoContainer.innerHTML = '<h3>No todos found...</h3>';
        return;
    }

    filteredTodoList.forEach((todo) => {
        const todoElement = createTodoLayout(todo);

        todoContainer.append(todoElement);
    })
};

render();