# 2do

Collaborative to do lists

# Dependencies

### Client

- [npm](https://www.npmjs.com)
- [Node.js](https://nodejs.org/)

### Server

- [npm](https://www.npmjs.com)
- [Node.js](https://nodejs.org/)
- [mongoDB](https://www.mongodb.com)

To start the server, run `make run_server` in the project root directory.

To start the client, run `make run_client`. You will need an Expo app running
on a phone, with which you scan the QR code that shows up in order to run the
app on it'.

### Database
When starting the database for the first time, run `db.users.createIndex({username: 1}, {unique: true})` in the mongo shell to make sure username's will be unique.