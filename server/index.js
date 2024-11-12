import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import InvoiceFetcher from './InvoiceFetcher.js';

dotenv.config();

const app = express();

// Stel CORS-opties in om alleen specifieke domeinen toe te staan
app.use(
    cors({origin: ['https://dev.owencoenraad.nl', 'https;//api.owencoenraad.nl', 'https://127.0.0.1:3000']})
  );
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const databaseName = "cluster0";
const collectionName = "invoices";

async function dbConnection() {
    try {
        await client.connect();
        console.log("MongoDB connected successfully.");
    } catch (err) {
        console.error("Failed to connect to MongoDB.", err);
    }
}

// Server status
app.get("/", (req, res) => {
    res.send("Server is ready.");
});

// GET route om alle facturen op te halen
app.get("/api/invoices", async (req, res) => {
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const invoices = await collection.find().toArray();
        res.status(200).send(invoices);
    } catch (err) {
        console.error("Error fetching invoices: ", err);
        res.status(500).send({ message: "Failed to retrieve invoices" });
    }
});

// Factuur opslaan in de database
app.post("/api/invoices", async (req, res) => {
    console.log(req.body);
});

// API route om e-mailbijlagen op te halen
app.get("/api/fetch-invoices", (req, res) => {
    const emailConfig = {
        user: process.env.EMAIL,
        password: process.env.PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: true,
    };

    const fetcher = new InvoiceFetcher(emailConfig, './invoices');
    res.status(200).send({ message: 'Facturen worden opgehaald. Bekijk console log voor verdere details' });
});

async function serverStart() {
    await dbConnection();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is ready op https://0.0.0.0:${PORT}`);
    });
}

serverStart();
