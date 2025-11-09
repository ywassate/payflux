"use client";

import { InvoiceWithDetails } from "../lib/types";
import { BarChart3 } from "lucide-react";

interface RevenueChartProps {
  invoices: InvoiceWithDetails[];
}

export default function RevenueChart({ invoices }: RevenueChartProps) {
  // Obtenir les 6 derniers mois
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const currentMonth = new Date().getMonth();

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    return {
      name: months[monthIndex],
      index: monthIndex,
    };
  });

  // Calculer les revenus par mois
  const monthlyData = last6Months.map((month) => {
    const monthRevenue = invoices
      .filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return invDate.getMonth() === month.index && inv.paymentStatus === "PAID";
      })
      .reduce((sum, inv) => sum + inv.totalTTC, 0);

    return {
      month: month.name,
      revenue: monthRevenue,
    };
  });

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-xl border border-themed p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            Revenus des 6 derniers mois
          </h3>
          <p className="text-sm text-muted">Factures payées uniquement</p>
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <div className="space-y-4">
        {monthlyData.map((data, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-secondary w-12">{data.month}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(data.revenue)}
              </span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(data.revenue / maxRevenue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {monthlyData.every((d) => d.revenue === 0) && (
        <div className="text-center py-8 text-muted">
          <p>Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}