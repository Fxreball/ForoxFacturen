import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import InvoiceFetcher from './InvoiceFetcher.js'; 

dotenv.config();

const app = express();
app.use(cors());
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
app.get("/api", (req, res) => {
    res.send("Server is ready.");
});

// GET route om alle facturen op te halen
app.get("/api/invoices", async (req, res) => {
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        // Haal alle facturen op uit de collectie
        const invoices = await collection.find().toArray();

        // Stuur de facturen terug als antwoord
        res.status(200).send(invoices);
    } catch (err) {
        console.error("Error fetching invoices: ", err);
        res.status(500).send({ message: "Failed to retrieve invoices" });
    }
});

// Factuur opslaan in de database
app.post("/api/invoices", async (req, res) => {
    // Log de body van de request om te zien wat er verzonden wordt
    console.log(req.body);

    const invoiceData = req.body; // De ontvangen factuurdata
    const invoiceNumber = invoiceData.invoiceNumber; // Assuming the invoice number is part of the data

    try {
        // Verbind met de database
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        // Controleer of het factuurnummer al bestaat
        const existingInvoice = await collection.findOne({ invoiceNumber: invoiceNumber });

        if (existingInvoice) {
            // Als het factuurnummer al bestaat, stuur een foutmelding terug
            console.log(`Invoice number ${invoiceNumber} already exists.`);
            return res.status(400).send({ message: 'Invoice already exists with this number.' });
        }

        // Sla de factuur op in de MongoDB-database
        const result = await collection.insertOne(invoiceData);
        
        console.log('Invoice saved to MongoDB:', result);

        // Stuur een succesresponse terug
        res.status(200).send({ message: 'Invoice saved successfully', data: result });
    } catch (err) {
        console.error('Error saving invoice to MongoDB:', err);
        // Stuur een foutmelding terug als er iets misgaat
        res.status(500).send({ message: 'Error saving invoice data', error: err.message });
    }
});

// API route om e-mailbijlagen op te halen
app.get("/api/fetch-invoices", (req, res) => {
    // Maak de emailConfig object op basis van je .env variabelen
    const emailConfig = {
        user: process.env.EMAIL,
        password: process.env.PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: true
    };

    // Maak de fetcher aan en start het proces
    const fetcher = new InvoiceFetcher(emailConfig, './invoices');
    
    // Feedback sturen over het ophalen van de bijlagen
    res.status(200).send({ message: 'Facturen worden opgehaald. Bekijk console log voor verdere details' });
});

async function serverStart() {
    await dbConnection();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is ready op http://localhost:${PORT}`);
        });    
}

serverStart();


