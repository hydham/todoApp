const express = require('express');
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());

var readPromise = new Promise((resolve, reject) => {
  fs.readFile('todos.json', 'utf-8', (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(JSON.parse(data));
    }
  })
})

function writePromise(data, response) {
  return new Promise((resolve, reject) => {
    fs.writeFile('todos.json', JSON.stringify(data), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    })
  })
}

app.get('/todos', (req, res) => {
  readPromise
  .then((result) => (
    res.status(200).json(result)
    ))
  .catch((err) =>(
    res.status(404)
  ))
})

app.get('/todos/:id', (req, res) => {
  readPromise
  .then((todos) => {
    var todo = todos.find(element => (element.id === parseInt(req.params.id)));
    if(!todo) {
      res.status(404).send("Id not found");
    } else {
      res.status(200).json(todo);
    }
  })
  .catch((err) => {
    res.status(404).send(err)
  })
})

app.post('/todos', (req, res) => {
  readPromise
  .then((todos) => {
    let max_id = todos.reduce((max, obj) => (max > obj.id ? max : obj.id), 0);
    let new_id = max_id + 1;
    let new_todo = {
      id: new_id,
      title: req.body.title,
      completed: req.body.completed || false,
      description: req.body.description
    }
    todos.push(new_todo);
    return writePromise(todos, new_todo);
  })
  .then((new_todo) => {
    res.status(201).json(new_todo)
  })
  .catch((err) => {
    res.send(err);
  })
})

app.put('/todos/:id', (req, res) => {
  readPromise
  .then((todos) => {
    const todoIndex = todos.findIndex(element => (element.id === parseInt(req.params.id)))
    if (todoIndex == -1) {
      res.status(404).send("ID not found")
    } else {
      todos[todoIndex].title = req.body.title;
      todos[todoIndex].completed = req.body.completed;
      return writePromise(todos);
    }
  })
  .then(() => {
    res.status(200).send();
  })
  .catch(err => console.log(err))
})

app.delete('/todos/:id', (req, res) => {
  readPromise
  .then((todos) => {
    var indexToDelete = todos.findIndex(element => (element.id === parseInt(req.params.id)));
    if (indexToDelete == -1) {
      res.status(404).json({error: "ID not found"})
    } else {
      todos.splice(indexToDelete,1);
    }
    return writePromise(todos);
  })
  .then(() => res.status(200).send())
  .catch(err => console.log(err))
  }
)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
})

// for all other routes, return 404
app.use((req, res, next) => {
  res.status(404).send();
})

app.listen(3000, ()=> {
    console.log(`app listening on ${port}`)
  })