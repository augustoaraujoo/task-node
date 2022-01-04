const express = require('express');
const app = express()
const { v4: uuidv4 } = require('uuid');

app.use(express.json())

const users = [];


function verifyIfUserExistsAccount(request, response, next) {

    const { username } = request.headers;

    const verifyExists = users.find((users) => users.username === username)

    if (!verifyExists) {
        return response.status(400).json({ error: 'error' })
    }

    request.users = verifyExists

    return next()
}
app.post("/users", (request, response) => {
    const { name, username } = request.body;

    const userExists = users.some(users => users.username === username)

    if (userExists) {
        return response.status(400).json({ error: 'conta já existe' })
    }

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    })

    return response.status(201).send()

})

app.post('/todos', verifyIfUserExistsAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { users } = request;

    const createTodo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        create_at: new Date()
    }

    users.todos.push(createTodo)

    return response.status(201).send()

})

app.get("/todos", verifyIfUserExistsAccount, (request, response) => {
    const { username } = request.headers;

    const user = users.find((users) => users.username === username)

    if (!user) {
        return response.status(400).json({ error: 'user not found' })
    }

    return response.json(user.todos)

})

app.put("/todos/:id", verifyIfUserExistsAccount, (request, response) => {
    const { users } = request;
    const { id } = request.params;
    const { title, deadline } = request.body;


    const alteraçãoTitleDeadline = {
        title,
        deadline: new Date(deadline),
    }

    users.todos.push(alteraçãoTitleDeadline)
    return response.status(201).send()
})
app.patch("/todos/:id/done", verifyIfUserExistsAccount, (request, response) => {

    const { users } = request;
    const { id } = request.params;
    const { isdone } = request.body;
    const checkTodo = users.todos.find(todo => todo.id === id);

    if (!checkTodo) {
        return response.status(404).json({ error: 'Todo not found' });
    }

    checkTodo.done = isdone;

    return response.json(checkTodo);
})
app.delete("/todos/:id", verifyIfUserExistsAccount, (request, response) => {
    const { id } = request.params;
    const { username } = request.headers;
    const { users } = request;

    users.todos.splice(id, 1)
    return response.status(204).json(users)

})

module.exports = app;