import React, { useState } from "react";
import axios from "axios";

const InvoiceComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const axiosInstance = axios.create({
    baseURL:"http://188.245.162.209:3000",
  });

  // Functie om de e-mailbijlagen op te halen
  const fetchInvoices = async () => {
    setLoading(true);
    setMessage(""); // Reset het bericht bij elke nieuwe poging

    try {
      // Roep de API aan om de bijlagen op te halen
      const response = await axiosInstance.get("/api/fetch-invoices");
      setMessage(response.data.message);
    } catch (error) {
      console.error("Er is een fout opgetreden bij het ophalen van de bijlagen:", error);
      setMessage("Er is een fout opgetreden bij het ophalen van de bijlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Facturen</h1>
      <button onClick={fetchInvoices} disabled={loading}>
        {loading ? "Bezig met ophalen..." : "Haal e-mailbijlagen op"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default InvoiceComponent;