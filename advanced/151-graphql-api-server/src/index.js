const { ApolloServer, gql } = require('apollo-server');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

// In-memory data store for demonstration purposes
let authors = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

let posts = [
  { id: '101', title: 'First Post', content: 'This is the content of the first post.', authorId: '1' },
  { id: '102', title: 'Second Post', content: 'Content for the second post here.', authorId: '2' },
  { id: '103', title: 'GraphQL Basics', content: 'Understanding schema design.', authorId: '1' },
];

// Constants for subscription topics
const POST_ADDED = 'POST_ADDED';
const POST_UPDATED = 'POST_UPDATED';
const POST_DELETED = 'POST_DELETED';

// Schema Definition Language (SDL)
const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    author: Author!
  }

  type Author {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  type Query {
    hello: String!
    posts: [Post!]!
    post(id: ID!): Post
    authors: [Author!]!
    author(id: ID!): Author
  }

  type Mutation {
    createPost(title: String!, content: String!, authorId: ID!): Post!
    updatePost(id: ID!, title: String, content: String): Post
    deletePost(id: ID!): Boolean!
    createAuthor(name: String!): Author!
  }

  type Subscription {
    postAdded: Post!
    postUpdated: Post!
    postDeleted: ID!
  }
`;

// Resolvers define how to fetch the types defined in the schema
const resolvers = {
  Query: {
    hello: () => 'Hello, GraphQL!',
    posts: () => posts,
    post: (parent, { id }) => posts.find(post => post.id === id),
    authors: () => authors,
    author: (parent, { id }) => authors.find(author => author.id === id),
  },
  Post: {
    author: (parent) => authors.find(author => author.id === parent.authorId),
  },
  Author: {
    posts: (parent) => posts.filter(post => post.authorId === parent.id),
  },
  Mutation: {
    createPost: (parent, { title, content, authorId }) => {
      const newPost = {
        id: String(posts.length + 101), // Simple ID generation
        title,
        content,
        authorId,
      };
      posts.push(newPost);
      pubsub.publish(POST_ADDED, { postAdded: newPost }); // Publish subscription event
      return newPost;
    },
    updatePost: (parent, { id, title, content }) => {
      const postIndex = posts.findIndex(post => post.id === id);
      if (postIndex === -1) return null;

      const updatedPost = { ...posts[postIndex] };
      if (title) updatedPost.title = title;
      if (content) updatedPost.content = content;

      posts[postIndex] = updatedPost;
      pubsub.publish(POST_UPDATED, { postUpdated: updatedPost }); // Publish subscription event
      return updatedPost;
    },
    deletePost: (parent, { id }) => {
      const initialLength = posts.length;
      posts = posts.filter(post => post.id !== id);
      if (posts.length < initialLength) {
        pubsub.publish(POST_DELETED, { postDeleted: id }); // Publish subscription event
        return true;
      }
      return false;
    },
    createAuthor: (parent, { name }) => {
      const newAuthor = {
        id: String(authors.length + 1), // Simple ID generation
        name,
      };
      authors.push(newAuthor);
      return newAuthor;
    },
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
    postUpdated: {
      subscribe: () => pubsub.asyncIterator([POST_UPDATED]),
    },
    postDeleted: {
      subscribe: () => pubsub.asyncIterator([POST_DELETED]),
    },
  },
};

// Create an Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Enable subscriptions
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      console.log('Client connected for subscriptions');
    },
    onDisconnect: (webSocket, context) => {
      console.log('Client disconnected from subscriptions');
    },
  },
});

// Start the server
server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
