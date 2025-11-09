"use client";

import { useState } from "react";
import { InvoiceWithDetails } from "../lib/types";
import { TrendingUp } from "lucide-react";

interface SalesMetricsChartProps {
  invoices: InvoiceWithDetails[];
}

type TimeScale = "monthly" | "yearly";

export default function SalesMetricsChart({
  invoices,
}: SalesMetricsChartProps) {
  const [timeScale, setTimeScale] = useState<TimeScale>("monthly");

  // Fonction pour calculer les données mensuelles (12 derniers mois)
  const getMonthlyData = () => {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return (
          invDate.getMonth() === date.getMonth() &&
          invDate.getFullYear() === date.getFullYear()
        );
      });

      months.push({
        label: date.toLocaleDateString("fr-FR", {
          month: "short",
          year: "2-digit",
        }),
        fullDate: date,
        total: monthInvoices.length,
        paid: monthInvoices.filter((inv) => inv.paymentStatus === "PAID").length,
        revenue: monthInvoices
          .filter((inv) => inv.paymentStatus === "PAID")
          .reduce((sum, inv) => sum + inv.totalTTC, 0),
      });
    }

    return months;
  };

  const getYearlyData = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = 9; i >= 0; i--) {
      const year = currentYear - i;
      const yearInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return invDate.getFullYear() === year;
      });

      years.push({
        label: year.toString(),
        fullDate: new Date(year, 0, 1),
        total: yearInvoices.length,
        paid: yearInvoices.filter((inv) => inv.paymentStatus === "PAID").length,
        revenue: yearInvoices
          .filter((inv) => inv.paymentStatus === "PAID")
          .reduce((sum, inv) => sum + inv.totalTTC, 0),
      });
    }

    return years;
  };

  const data = timeScale === "monthly" ? getMonthlyData() : getYearlyData();

  const calculateGrowth = () => {
    if (data.length < 2) return 0;

    const current = data[data.length - 1].revenue;
    const previous = data[data.length - 2].revenue;

    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const growth = calculateGrowth();

  const rawMaxValue = Math.max(
    ...data.map((d) => Math.max(d.total, d.paid)),
    1
  );

  const getScaleMax = (max: number) => {
    if (max === 0) return 5;

    const orderOfMagnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const multipliers = [1, 2, 5, 10];

    for (const multiplier of multipliers) {
      const candidate = multiplier * orderOfMagnitude;
      if (candidate >= max) {
        return candidate;
      }
    }

    return 10 * orderOfMagnitude;
  };

  const maxValue = getScaleMax(rawMaxValue);

  const currentPeriod = data[data.length - 1];
  const realtimeSales = currentPeriod?.total || 0;
  const revenue = currentPeriod?.revenue || 0;
  const customerRetention =
    currentPeriod && currentPeriod.total > 0
      ? ((currentPeriod.paid / currentPeriod.total) * 100).toFixed(2)
      : "0.00";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-xl border border-themed overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">
            Statistiques des revenus
          </h3>

          <div className="flex gap-2 bg-card-hover rounded-lg p-1">
            <button
              onClick={() => setTimeScale("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeScale === "monthly"
                  ? "bg-card text-primary shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setTimeScale("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeScale === "yearly"
                  ? "bg-card text-primary shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Annuel
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-secondary">Ventes période</span>
            <span className="text-sm font-bold text-primary">
              {realtimeSales}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp
                  className={`h-3 w-3 ${
                    growth >= 0 ? "text-green-500" : "text-red-500 rotate-180"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    growth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {growth >= 0 ? "+" : ""}
                  {growth.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-muted">
                vs {timeScale === "monthly" ? "mois" : "année"} précédent
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-secondary">Revenus</span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(revenue)}
            </span>
            <span className="text-xs text-muted">
              {timeScale === "monthly" ? "ce mois" : "cette année"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-secondary">Taux paiement</span>
            <span className="text-sm font-bold text-primary">
              {customerRetention}%
            </span>
            <span className="text-xs text-muted">factures payées</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative h-64">
          <div className="absolute inset-0 flex flex-col justify-between">
            {(() => {
              // Créer des valeurs d'échelle bien espacées et uniques
              const step = maxValue / 4;
              const gridValues = [
                maxValue,
                Math.round(maxValue - step),
                Math.round(maxValue - step * 2),
                Math.round(maxValue - step * 3),
                0,
              ];

              // Filtrer les doublons
              const uniqueValues = gridValues.filter(
                (value, index, self) => self.indexOf(value) === index
              );

              return uniqueValues.map((value, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-xs text-muted w-8 text-right mr-2">
                    {value}
                  </span>
                  <div className="flex-1 h-px bg-border-themed"></div>
                </div>
              ));
            })()}
          </div>

          <div className="absolute left-10 right-0 bottom-0 top-0 flex items-end justify-between gap-1 pb-px pointer-events-none">
            {data.map((item, index) => {
              const totalHeight = (item.total / maxValue) * 100;
              const paidHeight = (item.paid / maxValue) * 100;

              return (
                <div
                  key={index}
                  className="flex-1 flex items-end justify-center gap-1 group h-full pointer-events-auto"
                >
                  <div className="relative flex-1 max-w-[16px] h-full flex items-end">
                    {item.total > 0 && (
                      <div
                        className="w-full bg-orange-400 rounded-t hover:bg-orange-500 transition-colors duration-200 cursor-pointer"
                        style={{
                          height: `${totalHeight}%`,
                          minHeight: item.total > 0 ? "2px" : "0",
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          <div className="bg-primary text-card text-xs font-semibold px-2 py-1 rounded shadow-xl whitespace-nowrap">
                            {item.total} facture{item.total > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-1 max-w-[16px] h-full flex items-end">
                    {item.paid > 0 && (
                      <div
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                        style={{
                          height: `${paidHeight}%`,
                          minHeight: item.paid > 0 ? "2px" : "0",
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          <div className="bg-primary text-card text-xs font-semibold px-2 py-1 rounded shadow-xl whitespace-nowrap">
                            {item.paid} payée{item.paid > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-2 pl-10">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              <span className="text-xs text-muted font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-themed">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span className="text-sm text-secondary">Factures totales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-secondary">Factures payées</span>
          </div>
        </div>
      </div>
    </div>
  );
}
