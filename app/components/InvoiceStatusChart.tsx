"use client";

import { InvoiceWithDetails, STATUS_LABELS } from "../lib/types";
import { FileText } from "lucide-react";

interface InvoiceStatusChartProps {
  invoices: InvoiceWithDetails[];
}

export default function InvoiceStatusChart({ invoices }: InvoiceStatusChartProps) {
  // Initialiser tous les statuts avec 0
  const allStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

  const statusData = allStatuses.reduce((acc, status) => {
    acc[status] = { count: 0, total: 0 };
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Remplir avec les données réelles
  invoices.forEach((invoice) => {
    const status = invoice.status;
    if (statusData[status]) {
      statusData[status].count += 1;
      statusData[status].total += invoice.totalTTC;
    }
  });

  const statuses = allStatuses.map((status) => ({
    status,
    label: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    count: statusData[status].count,
    total: statusData[status].total,
  }));

  const totalInvoices = invoices.length;

  // Couleurs modernes avec hex pour chaque statut
  const statusColors: Record<string, { gradient: string; start: string; end: string }> = {
    DRAFT: { gradient: "from-amber-500 to-yellow-500", start: "#f59e0b", end: "#eab308" },
    SENT: { gradient: "from-blue-500 to-cyan-500", start: "#3b82f6", end: "#06b6d4" },
    PAID: { gradient: "from-green-500 to-emerald-500", start: "#22c55e", end: "#10b981" },
    OVERDUE: { gradient: "from-red-500 to-rose-500", start: "#ef4444", end: "#f43f5e" },
    CANCELLED: { gradient: "from-gray-500 to-slate-500", start: "#6b7280", end: "#64748b" },
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
      colorGradient: colorScheme.gradient,
      colorStart: colorScheme.start,
      colorEnd: colorScheme.end,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Répartition par statut
        </h3>
        <p className="text-sm text-gray-500">Distribution des factures</p>
      </div>

      <div>
        {statuses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
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
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${segment.colorGradient}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {segment.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {segment.count} facture{segment.count > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {segment.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(segment.total)}
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${segment.colorGradient} rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                    style={{ width: `${segment.percentage}%` }}
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
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Total des factures
                </p>
                <p className="text-lg font-bold text-gray-900">
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
