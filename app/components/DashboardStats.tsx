"use client";

import { InvoiceWithDetails } from "../lib/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DashboardStatsProps {
  invoices: InvoiceWithDetails[];
}

export default function DashboardStats({ invoices }: DashboardStatsProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculs des statistiques
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.paymentStatus === "PAID").length;
  const pendingInvoices = invoices.filter(
    (inv) => inv.lifecycle === "SENT" && (inv.paymentStatus === "PENDING" || inv.paymentStatus === "PARTIAL")
  ).length;
  const overdueInvoices = invoices.filter(
    (inv) => inv.paymentStatus === "OVERDUE"
  ).length;

  const totalRevenue = invoices
    .filter((inv) => inv.paymentStatus === "PAID")
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.lifecycle === "SENT" && (inv.paymentStatus === "PENDING" || inv.paymentStatus === "PARTIAL"))
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  // Calcul du mois précédent pour la comparaison
  const lastMonthInvoices = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return (
      invDate.getMonth() === currentMonth - 1 && invDate.getFullYear() === currentYear
    );
  });

  const currentMonthInvoices = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return (
      invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear
    );
  });

  const monthlyGrowth =
    lastMonthInvoices.length > 0
      ? ((currentMonthInvoices.length - lastMonthInvoices.length) /
          lastMonthInvoices.length) *
        100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Revenus totaux",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: monthlyGrowth,
      description: `${currentMonthInvoices.length} factures ce mois`,
    },
    {
      title: "En attente",
      value: formatCurrency(pendingAmount),
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      count: pendingInvoices,
      description: `${pendingInvoices} facture(s) en attente`,
    },
    {
      title: "Factures payées",
      value: paidInvoices.toString(),
      icon: CheckCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      percentage: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
      description: `${Math.round((paidInvoices / totalInvoices) * 100)}% du total`,
    },
    {
      title: "En retard",
      value: overdueInvoices.toString(),
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      alert: overdueInvoices > 0,
      description: overdueInvoices > 0 ? "Action requise" : "Aucun retard",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl border border-themed p-6 hover:shadow-lg transition-all duration-200 fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary mb-2">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-primary mb-1">
                {stat.value}
              </h3>
              <p className="text-xs text-muted">{stat.description}</p>

              {/* Trend indicator */}
              {stat.trend !== undefined && (
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(stat.trend).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted">vs mois dernier</span>
                </div>
              )}

              {/* Alert indicator */}
              {stat.alert && (
                <div className="mt-3 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium inline-block">
                  ⚠ Attention requise
                </div>
              )}
            </div>

            <div className={`${stat.iconBg} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}