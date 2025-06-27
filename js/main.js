class LocalStorage {
    #keyName;

    constructor(keyName) {
        this.#keyName = keyName;
    }

    GetItem() {
        const items = localStorage.getItem(this.#keyName);
        return items ? JSON.parse(items) : [];
    }

    SetItem(itemsList) {
        localStorage.setItem(this.#keyName, JSON.stringify(itemsList));
    }
}

class DOM {
    query(selector) {
        return document.querySelector(selector);
    }

    create(type, textContent, ...className) {
        const item = document.createElement(type);
        item.textContent = textContent;
        item.classList.add(...className);

        return item;
    }
}

class Item {
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }
}

class TodoItem extends Item {
    constructor(id, text, completed = false) {
        super(id, text);
        this.completed = completed;
        this.createAt = this.GetDateRepresentation();
    }

    GetDateRepresentation(todoCreatedDate) {
        return Intl.DateTimeFormat("ru-RU", {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(todoCreatedDate)
    }
}

class TodoApp {
    constructor() {
        this.dom = new DOM;
        this.todosStorage = new LocalStorage('todos');

        this.todoList = this.todosStorage.GetItem();
        this.filteredTodoList = [];
        this.todoInput = this.dom.query('[data-text-field]');
        this.todoAddBtn = this.dom.query('[data-todo-btn]');
        this.todoSearch = this.dom.query('[data-search-field]');
        this.todoContainer = this.dom.query('[data-todo-list]');
        this.todoCount = this.dom.query('[data-todo-count]');
        this.todoRemoveAllBtn = this.dom.query('[data-remove-all]');

        this.bindEvents();
        this.render();
        this.renderFiltered();
    }

    addTodo(text) {
        const newTodo = new TodoItem(Date.now(), text)
        this.todoList.push(newTodo);
        this.todosStorage.SetItem(this.todoList);
        this.render();
    }

    removeTodo(id) {
        this.todoList = this.todoList.filter(todo => todo.id !== id);
        this.todosStorage.SetItem(this.todoList);
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todoList.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.todosStorage.SetItem(this.todoList);
            this.render();
        }
    }

    editTodo(id) {
        const todo = this.todoList.find(todo => todo.id === id);
        if (todo) {
            const editedText = prompt('edit to do').trim();
            if(editedText) {
                todo.text = editedText;
                todo.completed = false;
            }
            this.todosStorage.SetItem(this.todoList);
            this.render();
        }
    }

    filterAndRenderFilteredTodos = (searchValue) => {
        this.filteredTodoList = this.todoList.filter((t) => {
            return t.text.includes(searchValue);
        });

        this.renderFiltered();
    }

    bindEvents() {
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.addTodo(e.target.value.trim());
                this.todoInput.value = '';
                this.todoSearch.value = '';
            }
        })

        this.todoInput.addEventListener('input', () => {
            if (this.todoSearch.value.trim()) {
                this.todoSearch.value = '';
            }

            this.render()
        })

        this.todoAddBtn.addEventListener('click', () => {
            if (this.todoInput.value.trim()) {
                this.addTodo(this.todoInput.value.trim());
                this.todoInput.value = '';
                this.todoSearch.value = '';
            }
        })

        this.todoRemoveAllBtn.addEventListener('click', () => {
            this.todoList = this.todoList.filter(todo => {
                if (todo.completed !== true) {
                    return todo;
                }
            })
            this.todoSearch.value = '';

            this.todosStorage.SetItem(this.todoList);
            this.render();
        })

        this.todoSearch.addEventListener('input', (e) => {
            const searchValue = e.target.value.trim();

            this.filterAndRenderFilteredTodos(searchValue);
        })

        this.todoContainer.addEventListener('click', (e) => {
            const el = e.target;

            if (el.classList.contains('todo__item-remove-btn')) {
                const id = Number(el.dataset.id);
                this.removeTodo(id);
            } else if (el.classList.contains('todo__item-checkbox')) {
                const id = Number(el.dataset.id);
                this.toggleTodo(id);
            } else if (el.classList.contains('todo__item-edit-btn')) {
                const id = Number(el.dataset.id);
                this.editTodo(id);
            }
        })
    }

    render() {
        this.todoContainer.innerHTML = '';

        this.todoCount.textContent = `${this.todoList.reduce((count, todo) => count += todo.completed === true ? 1 : 0, 0)} items completed`

        if (this.todoList.length === 0) {
            this.todoContainer.innerHTML = '<h3>No todos...</h3>';
            return;
        }

        this.todoList.forEach(todo => {
            const todoItem = this.dom.create('li', '', 'todo__list-item');
            todoItem.dataset.id = todo.id;

            const todoCheckBoxWrapper = this.dom.create('div', '', 'todo__item-checkbox-wrapper');
            const todoCheckBox = this.dom.create('input', '', 'todo__item-checkbox');
            todoCheckBox.type = 'checkbox'
            todoCheckBox.checked = todo.completed;
            todoCheckBox.dataset.id = todo.id;


            todoCheckBoxWrapper.appendChild(todoCheckBox);
            todoItem.appendChild(todoCheckBoxWrapper);

            const todoInfo = this.dom.create('div', '', 'todo__item-info');
            const todoText = this.dom.create('p', todo.text, 'todo__info-text');
            const todoDate = this.dom.create('span', todo.createAt, 'todo__info-date');

            todoInfo.appendChild(todoText);
            todoInfo.appendChild(todoDate);
            todoItem.appendChild(todoInfo);

            const todoItemBtnWrapper = this.dom.create('div', '', 'todo__item-btn-wrapper');
            const todoEditBtn = this.dom.create('button', '', 'todo__item-edit-btn');
            const todoRemoveBtn = this.dom.create('button', '\u2716', 'todo__item-remove-btn');
            todoRemoveBtn.dataset.id = todo.id;
            todoRemoveBtn.disabled = !todo.completed;
            todoEditBtn.dataset.id = todo.id;

            todoItemBtnWrapper.appendChild(todoEditBtn);
            todoItemBtnWrapper.appendChild(todoRemoveBtn);
            todoItem.appendChild(todoItemBtnWrapper);

            this.todoContainer.appendChild(todoItem);
        });
    };

    renderFiltered = () => {
        this.todoContainer.innerHTML = '';

        if (this.filteredTodoList.length === 0) {
            this.todoContainer.innerHTML = '<h3>No todos found...</h3>';
            return;
        }

        this.filteredTodoList.forEach((todo) => {
            const todoItem = this.dom.create('li', '', 'todo__list-item');
            todoItem.dataset.id = todo.id;

            const todoCheckBoxWrapper = this.dom.create('div', '', 'todo__item-checkbox-wrapper');
            const todoCheckBox = this.dom.create('input', '', 'todo__item-checkbox');
            todoCheckBox.type = 'checkbox'
            todoCheckBox.checked = todo.completed;
            todoCheckBox.dataset.id = todo.id;


            todoCheckBoxWrapper.appendChild(todoCheckBox);
            todoItem.appendChild(todoCheckBoxWrapper);

            const todoInfo = this.dom.create('div', '', 'todo__item-info');
            const todoText = this.dom.create('p', todo.text, 'todo__info-text');
            const todoDate = this.dom.create('span', todo.createAt, 'todo__info-date');

            todoInfo.appendChild(todoText);
            todoInfo.appendChild(todoDate);
            todoItem.appendChild(todoInfo);

            const todoItemBtnWrapper = this.dom.create('div', '', 'todo__item-btn-wrapper');
            const todoEditBtn = this.dom.create('button', '', 'todo__item-edit-btn');
            const todoRemoveBtn = this.dom.create('button', '\u2716', 'todo__item-remove-btn');
            todoRemoveBtn.dataset.id = todo.id;
            todoRemoveBtn.disabled = !todo.completed;

            todoItemBtnWrapper.appendChild(todoEditBtn);
            todoItemBtnWrapper.appendChild(todoRemoveBtn);
            todoItem.appendChild(todoItemBtnWrapper);

            this.todoContainer.appendChild(todoItem);
        })
    };
}

new TodoApp().render();