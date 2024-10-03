# Node.js REST API

This project is a simple REST API built with Node.js using the core modules `http`, `fs`, and `path`. It performs CRUD (Create, Read, Update, Delete) operations on a list of items stored in a JSON file (`items.json`).

## Features

- **GET** `/items`: Retrieve all items.
- **POST** `/items`: Add a new item. Each item must include `name` and `description`.
- **PUT** `/items/:id`: Update an item by its ID.
- **DELETE** `/items/:id`: Delete an item by its ID.

## Project Setup

To set up and run the project locally, follow these steps:

### 1. Install Node.js

Ensure you have [Node.js](https://nodejs.org/) installed on your system. You can check if it's installed by running:

node -v on your command prompt or power shell.

Use npm  -v  to display the installed version of npm.

### 2. Initialize the Project

Create a project directory.
Inside a project create a file called server.js to create a server that will loisten for incoming requests. 

Navigate to the directory and initialize a Node.js project: using npm init -y

### 3. Running the Server

To run the server, use the following command:

node server.js




























   





