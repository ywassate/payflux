"use client";

import { useState, useMemo } from "react";
import { InvoiceStatus } from "@prisma/client";
import { InvoiceWithDetails } from "../lib/types";
import InvoiceFilters from "./InvoiceFilters";
import InvoiceTable from "./InvoiceTable";

interface InvoiceDashboardProps {
  initialInvoices: InvoiceWithDetails[];
  categories: { id: string; name: string }[];
}

export default function InvoiceDashboard({
  initialInvoices,
  categories,
}: InvoiceDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | "ALL">(
    "ALL"
  );
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredInvoices = useMemo(() => {
    return initialInvoices.filter((invoice) => {
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.clientName.toLowerCase().includes(searchLower) ||
          invoice.clientEmail.toLowerCase().includes(searchLower) ||
          invoice.name.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filtre par statut
      if (selectedStatus !== "ALL" && invoice.status !== selectedStatus) {
        return false;
      }

      // Filtre par catégorie
      if (selectedCategory && invoice.category?.id !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [initialInvoices, searchTerm, selectedStatus, selectedCategory]);

  return (
    <div className="space-y-6">
      <InvoiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <div className="bg-card rounded-xl border border-themed">
        <div className="flex justify-between items-center px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-primary">
            {filteredInvoices.length} facture(s) trouvée(s)
          </h2>
        </div>
        <InvoiceTable invoices={filteredInvoices} />
      </div>
    </div>
  );
}
