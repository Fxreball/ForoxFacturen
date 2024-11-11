import mongoose from 'mongoose';

// Sub-schema voor Distributor
const distributorSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Contact: { type: String, required: true }
});

// Sub-schema voor Movie
const movieSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    ShowDate: { type: Date, required: true },
    TicketsSold: { type: Number, required: true },
    TicketPrice: { type: Number, required: true },
    TotalRevenue: { type: Number, required: true }
});

// Hoofd schema voor Invoice
const invoiceSchema = new mongoose.Schema({
    InvoiceNumber: { type: String, required: true },
    CinemaName: { type: String, required: true },
    CinemaLocation: { type: String, required: true },
    DateIssued: { type: Date, required: true },
    Distributor: { type: distributorSchema, required: true },  // Verwijzing naar sub-schema voor Distributor
    Movie: { type: movieSchema, required: true },  // Verwijzing naar sub-schema voor Movie
    AmountDue: { type: Number, required: true },
    Currency: { type: String, required: true },
    DueDate: { type: Date, required: true }
});

// Maak het Mongoose model aan
const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
