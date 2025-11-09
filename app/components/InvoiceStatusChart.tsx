"use client";

import { InvoiceWithDetails, PAYMENT_STATUS_LABELS } from "../lib/types";
import { FileText } from "lucide-react";
import { InvoicePaymentStatus } from "@prisma/client";

interface InvoiceStatusChartProps {
  invoices: InvoiceWithDetails[];
  isAdmin?: boolean;
}

export default function InvoiceStatusChart({ invoices, isAdmin = true }: InvoiceStatusChartProps) {
  // Afficher la distribution des statuts de paiement
  const allStatuses: InvoicePaymentStatus[] = [
    "PENDING",
    "PARTIAL",
    "PROCESSING",
    "PAID",
    "OVERDUE",
    "CANCELLED",
    "REFUNDED",
    "REJECTED"
  ];

  const statusData = allStatuses.reduce((acc, status) => {
    acc[status] = { count: 0, total: 0 };
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Remplir avec les données réelles
  invoices.forEach((invoice) => {
    const status = invoice.paymentStatus;
    if (statusData[status]) {
      statusData[status].count += 1;
      statusData[status].total += invoice.totalTTC;
    }
  });

  const statuses = allStatuses.map((status) => ({
    status,
    label: PAYMENT_STATUS_LABELS[status],
    count: statusData[status].count,
    total: statusData[status].total,
  }));

  const totalInvoices = invoices.length;

  // Couleurs pour chaque statut de paiement
  const statusColors: Record<string, { color: string }> = {
    PENDING: { color: "#eab308" }, // yellow-500
    PARTIAL: { color: "#f97316" }, // orange-500
    PROCESSING: { color: "#3b82f6" }, // blue-500
    PAID: { color: "#22c55e" }, // green-500
    OVERDUE: { color: "#ef4444" }, // red-500
    CANCELLED: { color: "#6b7280" }, // gray-500
    REFUNDED: { color: "#a855f7" }, // purple-500
    REJECTED: { color: "#dc2626" }, // red-600
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculer les pourcentages
  const segments = statuses.map((stat) => {
    const percentage = totalInvoices > 0 ? (stat.count / totalInvoices) * 100 : 0;
    const colorScheme = statusColors[stat.status] || statusColors.DRAFT;

    return {
      ...stat,
      percentage,
      color: colorScheme.color,
    };
  });

  return (
    <div className="bg-card rounded-xl border border-themed p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary">
          Répartition par statut
        </h3>
        <p className="text-sm text-muted">Distribution des factures</p>
      </div>

      <div>
        {statuses.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune facture disponible</p>
          </div>
        ) : (
          <div className="space-y-6">
            {segments.map((segment, index) => (
              <div key={index} className="space-y-2">
                {/* En-tête de la barre */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {segment.label}
                      </p>
                      <p className="text-xs text-muted">
                        {segment.count} facture{segment.count > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {segment.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted">
                      {formatCurrency(segment.total)}
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="relative h-8 bg-card-hover rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
                  >
                    {segment.percentage > 10 && (
                      <span className="text-xs font-semibold text-white">
                        {segment.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="pt-4 border-t border-themed">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">
                  Total des factures
                </p>
                <p className="text-lg font-bold text-primary">
                  {totalInvoices}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
