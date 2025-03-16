const express = require("express");
const mysql = require("mysql2");


const app = express();
app.use(express.json()); 

// Configure MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123000",
    database: "library"
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.log("Error connecting to MySQL:", err);
    }
});






// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server has been started on http://localhost:${port}`);
});


