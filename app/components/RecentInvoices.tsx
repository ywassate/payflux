"use client";

import { InvoiceWithDetails, getInvoiceDisplayStatus, getInvoiceDisplayColor } from "../lib/types";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

interface RecentInvoicesProps {
  invoices: InvoiceWithDetails[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const recentInvoices = invoices.slice(0, 5);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-xl border border-themed p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            Factures récentes
          </h3>
          <p className="text-sm text-muted">Dernières factures créées</p>
        </div>
        <Link
          href="/invoices"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {recentInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune facture</p>
          </div>
        ) : (
          recentInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate mb-1">
                  {invoice.invoiceNumber}
                </p>
                <p className="text-xs text-muted truncate">
                  {invoice.clientName || "Client non défini"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p className="text-sm text-secondary">
                  {formatDate(invoice.invoiceDate)}
                </p>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                    getInvoiceDisplayColor(invoice)
                  }`}
                >
                  {getInvoiceDisplayStatus(invoice)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}