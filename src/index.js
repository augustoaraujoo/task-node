const express = require('express');
const app = express()
const { v4: uuidv4 } = require('uuid');

app.use(express.json())

const users = [];


function checkExistsUserAccount(request, response, next) {

    const { username } = request.headers;
    const user = users.find((users) => users.username === username)

    if (!user) {
        return response.status(400).json({ error: 'error' })
    }

    request.user = user
    return next()
}
app.post("/users", (request, response) => {
    const { username, name } = request.body;

    const userAlreadyExists = users.find(user => user.username === username);

    if (userAlreadyExists) {
        return response.status(400).json({ error: 'User already exists' });
    }

    const user = {
        id: uuidv4(),
        name,
        username,
        todos: [],
    }

    users.push(user);

    return response.status(201).json(user);

})

app.post('/todos', checkExistsUserAccount, (request, response) => {

    const { title, deadline } = request.body;
    const { user } = request;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date(),
    }
    user.todos.push(todo)

    return response.status(201).json(todo)


})

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { username } = request.headers;
    const { user } = request;

    return response.json(user.todos)

})

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;

    const todo = user.todos.find(todo => todo.id === id);
    if (!todo) {
        return response.status(404).json({
            error: 'erro'
        })
    }
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo)
})
app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;
    const checkTodo = user.todos.find(todo => todo.id === id);

    if (!checkTodo) {
        return response.status(404).json({ error: 'Todo not found' });
    }

    checkTodo.done = true;

    return response.json(checkTodo);
})
app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { user } = request;

    const findIndexID = user.todos.findIndex(todo => todo.id === id);
    if (findIndexID === -1) {
        return response.status(404).json({ error: 'error' })
    }

    user.todos.splice(findIndexID, 1);

    return response.status(204).send();
})

module.exports = app;