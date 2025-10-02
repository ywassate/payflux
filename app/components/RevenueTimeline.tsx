"use client";

import { useState } from "react";
import { InvoiceWithDetails } from "../lib/types";
import { TrendingUp, Calendar } from "lucide-react";

interface RevenueTimelineProps {
  invoices: InvoiceWithDetails[];
}

type Period = "week" | "month" | "quarter" | "year";

export default function RevenueTimeline({ invoices }: RevenueTimelineProps) {
  const [period, setPeriod] = useState<Period>("month");

  const getDateRange = (period: Period) => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        return { start: startDate, end: now, label: "7 derniers jours" };
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        return { start: startDate, end: now, label: "30 derniers jours" };
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        return { start: startDate, end: now, label: "3 derniers mois" };
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        return { start: startDate, end: now, label: "12 derniers mois" };
    }
  };

  const { start, end, label } = getDateRange(period);

  // Filtrer les factures payées dans la période
  const filteredInvoices = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return invDate >= start && invDate <= end && inv.status === "PAID";
  });

  // Calculer les revenus par période
  const getTimelineData = () => {
    const dataPoints: { label: string; revenue: number }[] = [];
    const pointCount = period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 12 : 12;

    for (let i = 0; i < pointCount; i++) {
      const date = new Date(end);

      if (period === "week" || period === "month") {
        date.setDate(end.getDate() - (pointCount - 1 - i));
      } else if (period === "quarter") {
        date.setDate(1);
        date.setMonth(end.getMonth() - (pointCount - 1 - i));
      } else {
        date.setDate(1);
        date.setMonth(end.getMonth() - (pointCount - 1 - i));
      }

      const dayRevenue = filteredInvoices
        .filter((inv) => {
          const invDate = new Date(inv.invoiceDate);
          if (period === "week" || period === "month") {
            return invDate.toDateString() === date.toDateString();
          } else {
            return (
              invDate.getMonth() === date.getMonth() &&
              invDate.getFullYear() === date.getFullYear()
            );
          }
        })
        .reduce((sum, inv) => sum + inv.totalTTC, 0);

      let labelText = "";
      if (period === "week" || period === "month") {
        labelText = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        labelText = months[date.getMonth()];
      }

      dataPoints.push({ label: labelText, revenue: dayRevenue });
    }

    return dataPoints;
  };

  const timelineData = getTimelineData();
  const maxRevenue = Math.max(...timelineData.map((d) => d.revenue), 1);
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Revenus dans le temps</h3>
              <p className="text-sm text-gray-600">Évolution des revenus par période</p>
            </div>
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="flex flex-wrap gap-2">
          {(["week", "month", "quarter", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                period === p
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {p === "week"
                ? "7 jours"
                : p === "month"
                ? "30 jours"
                : p === "quarter"
                ? "3 mois"
                : "12 mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Total */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Revenu total</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Graphique */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {timelineData.map((data, index) => {
              const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex items-end justify-center h-full">
                    {/* Barre */}
                    <div className="relative w-full max-w-[40px]">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500 cursor-pointer shadow-lg"
                        style={{ height: `${height}%` }}
                      >
                        {/* Tooltip */}
                        {data.revenue > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                              {formatCurrency(data.revenue)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-xs text-gray-500 font-medium -rotate-45 origin-top-left mt-2">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {timelineData.every((d) => d.revenue === 0) && (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Aucune donnée disponible pour cette période</p>
          </div>
        )}
      </div>
    </div>
  );
}