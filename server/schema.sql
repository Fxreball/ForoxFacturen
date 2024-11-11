CREATE DATABASE foroxinvoices;

USE foroxinvoices;

CREATE TABLE Invoices (
    InvoiceId INT PRIMARY KEY AUTO_INCREMENT,
    InvoiceNumber VARCHAR(50),
    InvoiceDate DATE,
    TotalAmount DECIMAL(10, 2)
);
