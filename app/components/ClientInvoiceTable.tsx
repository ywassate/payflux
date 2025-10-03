"use client";

import { InvoiceWithDetails, STATUS_LABELS, STATUS_COLORS } from "../lib/types";
import { Eye, Download, MessageSquare, AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ClientInvoiceTableProps {
  invoices: InvoiceWithDetails[];
  currentUserId: string;
}

export default function ClientInvoiceTable({ invoices, currentUserId }: ClientInvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <p className="text-secondary text-lg">Aucune facture trouvée</p>
        <p className="text-muted mt-2">
          Vous n'avez pas encore de factures
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-[150px_140px_140px_150px_140px_200px] gap-4 py-4 bg-base-200 rounded-t-lg text-xs font-semibold text-muted uppercase tracking-wider px-4">
          <div>N° Facture</div>
          <div>Date</div>
          <div>Échéance</div>
          <div>Statut</div>
          <div>Montant TTC</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="bg-card divide-y divide-themed border-x border-b border-themed rounded-b-lg">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-[150px_140px_140px_150px_140px_200px] gap-4 px-4 py-5 hover:bg-base-200 transition-colors duration-150"
            >
              {/* N° Facture */}
              <div className="flex items-center overflow-hidden">
                <span className="font-semibold text-primary text-sm truncate">
                  {invoice.invoiceNumber}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center overflow-hidden">
                <span className="text-secondary text-sm truncate">
                  {formatDate(invoice.invoiceDate)}
                </span>
              </div>

              {/* Échéance */}
              <div className="flex items-center overflow-hidden">
                <span className="text-secondary text-sm truncate">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>

              {/* Statut */}
              <div className="flex items-center">
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border truncate w-full text-center ${
                    STATUS_COLORS[invoice.status]
                  }`}
                >
                  {STATUS_LABELS[invoice.status]}
                </span>
              </div>

              {/* Montant */}
              <div className="flex items-center overflow-hidden">
                <span className="font-semibold text-primary text-sm truncate">
                  {formatCurrency(invoice.totalTTC)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group"
                  title="Voir la facture"
                >
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Link>

                <Link
                  href={`/chat?clientId=${currentUserId}&invoiceId=${invoice.id}&subject=Facture ${invoice.invoiceNumber}`}
                  className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors group"
                  title="Discuter de cette facture"
                >
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Link>

                <a
                  href={`/api/invoices/${invoice.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors group"
                  title="Télécharger PDF"
                >
                  <Download className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </a>

                {(invoice.status === "SENT" || invoice.status === "PARTIAL") && (
                  <button
                    className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors group"
                    title="Contester la facture"
                    onClick={() => {
                      // TODO: Implémenter la logique de contestation
                      alert("Fonctionnalité de contestation en cours de développement");
                    }}
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </button>
                )}

                {(invoice.status === "SENT" || invoice.status === "PARTIAL" || invoice.status === "OVERDUE") && (
                  <button
                    className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors group"
                    title="Régler la facture"
                    onClick={() => {
                      // TODO: Implémenter le paiement
                      alert("Fonctionnalité de paiement en cours de développement");
                    }}
                  >
                    <CreditCard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
