"use client";

import { InvoiceWithDetails, STATUS_LABELS, STATUS_COLORS } from "../lib/types";
import { Trash2, Edit, Eye, MoreVertical, Download } from "lucide-react";
import { deleteInvoice, changeInvoiceStatus } from "../actions";
import { InvoiceStatus } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";

interface InvoiceTableProps {
  invoices: InvoiceWithDetails[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <p className="text-gray-500 text-lg">Aucune facture trouvée</p>
        <p className="text-gray-400 mt-2">
          Créez votre première facture pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>N° Facture</th>
            <th>Client</th>
            <th>Catégorie</th>
            <th>Date</th>
            <th>Échéance</th>
            <th>Statut</th>
            <th>Montant TTC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="font-semibold">{invoice.invoiceNumber}</td>
              <td>
                <div>
                  <div className="font-medium">{invoice.clientName || "—"}</div>
                  <div className="text-sm text-gray-500">
                    {invoice.clientEmail || "—"}
                  </div>
                </div>
              </td>
              <td>
                {invoice.category ? (
                  <span className="badge badge-outline">
                    {invoice.category.name}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td>{formatDate(invoice.invoiceDate)}</td>
              <td>{formatDate(invoice.dueDate)}</td>
              <td>
                <details className="dropdown dropdown-end">
                  <summary
                    className={`badge ${
                      STATUS_COLORS[invoice.status]
                    } cursor-pointer hover:opacity-80`}
                  >
                    {STATUS_LABELS[invoice.status]}
                  </summary>
                  <ul className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                      <li key={status}>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              invoice.id,
                              status as InvoiceStatus
                            )
                          }
                          disabled={loadingId === invoice.id}
                          className={invoice.status === status ? "bg-base-200" : ""}
                        >
                          {label}
                          {invoice.status === status && " ✓"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              </td>
              <td className="font-semibold">
                {formatCurrency(invoice.totalTTC)}
              </td>
              <td>
                <details className="dropdown dropdown-end">
                  <summary className="btn btn-ghost btn-sm">
                    <MoreVertical className="h-4 w-4" />
                  </summary>
                  <ul className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
                    <li>
                      <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Voir/Modifier
                      </Link>
                    </li>
                    <li>
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger PDF
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-error flex items-center gap-2"
                        disabled={loadingId === invoice.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {loadingId === invoice.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </li>
                  </ul>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}