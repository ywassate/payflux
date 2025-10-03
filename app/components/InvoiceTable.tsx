"use client";

import { InvoiceWithDetails, STATUS_LABELS, STATUS_COLORS } from "../lib/types";
import { Trash2, Eye, MoreVertical, Download, Check, MessageSquare } from "lucide-react";
import { deleteInvoice, changeInvoiceStatus } from "../actions";
import { InvoiceStatus } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";

interface InvoiceTableProps {
  invoices: InvoiceWithDetails[];
  isAdmin?: boolean;
}

export default function InvoiceTable({ invoices, isAdmin = true }: InvoiceTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      setLoadingId(id);
      try {
        await deleteInvoice(id);
        window.location.reload();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la facture");
        setLoadingId(null);
      }
    }
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    setLoadingId(id);
    setOpenStatusDropdown(null);
    try {
      await changeInvoiceStatus(id, status);
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Erreur lors du changement de statut");
      setLoadingId(null);
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200 rounded-lg mx-6 mb-6">
        <p className="text-secondary text-lg">Aucune facture trouvée</p>
        <p className="text-muted mt-2">
          Créez votre première facture pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-[1200px] px-6">
        {/* Header de la table */}
        <div className="grid grid-cols-[150px_200px_140px_120px_120px_150px_140px_100px] gap-4 py-4 bg-base-200 rounded-t-lg text-xs font-semibold text-muted uppercase tracking-wider px-4">
          <div>N° Facture</div>
          <div>Client</div>
          <div>Catégorie</div>
          <div>Date</div>
          <div>Échéance</div>
          <div>Statut</div>
          <div>Montant TTC</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Lignes de la table */}
        <div className="bg-card divide-y divide-themed border-x border-b border-themed rounded-b-lg">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-[150px_200px_140px_120px_120px_150px_140px_100px] gap-4 px-4 py-5 hover:bg-base-200 transition-colors duration-150"
            >
              {/* N° Facture */}
              <div className="flex items-center overflow-hidden">
                <span className="font-semibold text-primary text-sm truncate">
                  {invoice.invoiceNumber}
                </span>
              </div>

              {/* Client */}
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="font-medium text-primary text-sm truncate">
                  {invoice.clientName || "—"}
                </span>
                <span className="text-xs text-muted mt-0.5 truncate">
                  {invoice.clientEmail || "—"}
                </span>
              </div>

              {/* Catégorie */}
              <div className="flex items-center overflow-hidden">
                {invoice.category ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 truncate">
                    {invoice.category.name}
                  </span>
                ) : (
                  <span className="text-muted text-sm">—</span>
                )}
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

              {/* Statut - Dropdown */}
              <div className="flex items-center relative">
                <button
                  onClick={() =>
                    setOpenStatusDropdown(
                      openStatusDropdown === invoice.id ? null : invoice.id
                    )
                  }
                  disabled={loadingId === invoice.id}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 hover:opacity-80 truncate w-full text-left ${
                    STATUS_COLORS[invoice.status]
                  }`}
                >
                  {STATUS_LABELS[invoice.status]}
                </button>

                {/* Dropdown du statut */}
                {openStatusDropdown === invoice.id && (
                  <>
                    <div
                      className="fixed inset-0 z-[100]"
                      onClick={() => setOpenStatusDropdown(null)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-56 bg-card rounded-xl border border-themed shadow-xl z-[110] py-2">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusChange(invoice.id, status as InvoiceStatus)
                          }
                          disabled={loadingId === invoice.id}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 transition-colors duration-150 flex items-center justify-between ${
                            invoice.status === status
                              ? "bg-base-200 text-primary font-medium"
                              : "text-secondary"
                          }`}
                        >
                          <span>{label}</span>
                          {invoice.status === status && (
                            <Check className="h-4 w-4 text-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Montant */}
              <div className="flex items-center overflow-hidden">
                <span className="font-semibold text-primary text-sm truncate">
                  {formatCurrency(invoice.totalTTC)}
                </span>
              </div>

              {/* Actions - Dropdown */}
              <div className="flex items-center justify-center relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === invoice.id ? null : invoice.id)
                  }
                  className="p-2 rounded-lg hover:bg-base-200 transition-colors duration-150"
                >
                  <MoreVertical className="h-5 w-5 text-secondary" />
                </button>

                {/* Dropdown des actions */}
                {openDropdown === invoice.id && (
                  <>
                    <div
                      className="fixed inset-0 z-[100]"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-themed shadow-xl z-[110] py-2">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 transition-colors duration-150 flex items-center gap-3 text-secondary"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>{isAdmin ? "Voir/Modifier" : "Voir"}</span>
                      </Link>
                      <Link
                        href={`/chat?clientId=${invoice.userId}&invoiceId=${invoice.id}&subject=Facture ${invoice.invoiceNumber}`}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 transition-colors duration-150 flex items-center gap-3 text-secondary"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Discuter de cette facture</span>
                      </Link>
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200 transition-colors duration-150 flex items-center gap-3 text-secondary"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <Download className="h-4 w-4" />
                        <span>Télécharger PDF</span>
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setOpenDropdown(null);
                            handleDelete(invoice.id);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150 flex items-center gap-3 text-red-600"
                          disabled={loadingId === invoice.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>
                            {loadingId === invoice.id ? "Suppression..." : "Supprimer"}
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
