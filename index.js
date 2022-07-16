const epxress = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const app = epxress();


const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const AuthorType = new GraphQLObjectType({
    name :'Author',
    description:"authors of the books",
    fields:() => ({
        id:{type: new GraphQLNonNull(GraphQLInt)},
        name:{type: new GraphQLNonNull(GraphQLString)},
        books:{
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType= new GraphQLObjectType({
    name:"book",
    description:'this represents a book written by an author',
    fields:() => ({
        id :{ type :new GraphQLNonNull(GraphQLInt) },
        name :{type :new GraphQLNonNull(GraphQLString)},
        authorId: {type :new GraphQLNonNull(GraphQLInt)},
        author:{
            type:AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name:'Query',
    description:'root query',
    fields: () => ({
        book:{
            type:BookType,
            description:'a single book',
            args:{
                id:{
                    type:GraphQLInt,
                },

            },
            resolve:(parent,args) => books.find(book => book.id === args.id)
        },
        books:{
            type:new GraphQLList(BookType),
            description:'list of books',
            resolve:() => books
        },
        author:{
            type:AuthorType,
            description:'a single author',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args) => authors.find(author => author.id === args.id)
        },
        authors:{
            type:new GraphQLList(AuthorType),
            description:'list of authers',
            resolve:() => authors
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name:"Mutation",
    description:"Root Mutation",
    fields:() => ({
        addBook:{
            type: BookType,
            description:"added a book",
            args:{
                name:{type:new GraphQLNonNull(GraphQLString)},
                authorId:{type:new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent ,args) => {
                const book = {id: books.length + 1, name:args.name, authorId:args.authorId}
                books.push(book);
                return book;
            }
        },
        addAuthor:{
            type: AuthorType,
            description:"added an author",
            args:{
                name:{type:new GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent ,args) => {
                const author = {id: authors.length + 1, name:args.name}
                authors.push(author);
                return author;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query:rootQueryType,
    mutation:RootMutationType
})


app.use(
  '/graphql',
  expressGraphQL({
    schema:schema,
    graphiql: true,
  }),
);
app.listen(3000, () => {
    console.log(`app is now listening in port 3000`)
})