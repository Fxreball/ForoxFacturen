const mysql = require('mysql2'); 
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

async function fetchInvoices() {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM invoices");
        console.log(rows);
    } catch (error) {
        console.error('Error querying the database:', error);
    }
}

fetchInvoices(); // Roep de functie aan
