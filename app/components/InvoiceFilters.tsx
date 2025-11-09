"use client";

import { InvoicePaymentStatus } from "@prisma/client";
import { PAYMENT_STATUS_LABELS } from "../lib/types";
import { Search } from "lucide-react";

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: InvoicePaymentStatus | "ALL";
  setSelectedStatus: (value: InvoicePaymentStatus | "ALL") => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: { id: string; name: string }[];
}

export default function InvoiceFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedCategory,
  setSelectedCategory,
  categories,
}: InvoiceFiltersProps) {
  return (
    <div className="bg-card rounded-xl border border-themed p-6 shadow-sm">
      <h3 className="text-md font-semibold text-primary mb-1">
        Filtres avancés
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="N° facture, client, email..."
              className="w-full pl-10 pr-4 py-2.5 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-card text-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Statut de paiement
          </label>
          <select
            className="w-full px-4 py-2.5 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-card text-primary cursor-pointer"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as InvoicePaymentStatus | "ALL")
            }
          >
            <option value="ALL" className="bg-card text-primary">Tous les statuts</option>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-card text-primary">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Catégorie
          </label>
          <select
            className="w-full px-4 py-2.5 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-card text-primary cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="" className="bg-card text-primary">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-card text-primary">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
