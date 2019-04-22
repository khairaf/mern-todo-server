//import { GraphQLServer } from 'graphql-yoga'
// ... or using `require()`
const { GraphQLServer } = require('graphql-yoga')
const mongoose = require('mongoose');
const path = require("path")


mongoose.connect(process.env.MONGOLAB_URI ||'mongodb://localhost/test5', {useNewUrlParser: true});

var Todo = mongoose.model('Todo', {
  text: String,
  complete: Boolean,
});

const typeDefs = `
  type Query {
    hello(name: String): String!
    todos: [Todo]
  }
  type Todo {
    id: ID!
    text: String!
    complete: Boolean!
  }
  type Mutation {
    createTodo(text: String!): Todo
    updateTodo(id: ID!, complete: Boolean!): Boolean
    removeTodo(id: ID!): Boolean
  }
`

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    todos: () => Todo.find()
  },
  Mutation: {
  createTodo: async (_, { text }) => {
    const todo = new Todo({ text, complete: false });
    await todo.save();
    return todo;
  },
  updateTodo: async (_, { id, complete }) => {
    await Todo.findByIdAndUpdate(id, {complete});
    return true;
  },
  removeTodo: async (_, { id }) => {
    await Todo.findByIdAndRemove(id);
    return true;
  }
  }
}


// // ... other app.use middleware added later for heroku 
// app.use(express.static(path.join(__dirname, "client", "build")))

// // ...
// // Right before your app.listen(), add this: added later for heroku 
// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });

const server = new GraphQLServer({ typeDefs, resolvers });
mongoose.connection.once('open', () => {
  // we're connected!
server.start(() => console.log('Server is running on localhost:4000'));

});