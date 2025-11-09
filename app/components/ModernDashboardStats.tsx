"use client";

import { InvoiceWithDetails } from "../lib/types";
import { TrendingUp, DollarSign, FileText, Users } from "lucide-react";

interface ModernDashboardStatsProps {
  invoices: InvoiceWithDetails[];
}

export default function ModernDashboardStats({
  invoices,
}: ModernDashboardStatsProps) {
  // Calculs
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Clients - Période actuelle vs période précédente
  const currentMonthClients = new Set(
    invoices
      .filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return (
          invDate.getMonth() === currentMonth &&
          invDate.getFullYear() === currentYear
        );
      })
      .map((inv) => inv.clientName)
  ).size;

  const lastMonthClients = new Set(
    invoices
      .filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return (
          invDate.getMonth() === lastMonth &&
          invDate.getFullYear() === lastMonthYear
        );
      })
      .map((inv) => inv.clientName)
  ).size;

  const clientsGrowth =
    lastMonthClients > 0
      ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100
      : currentMonthClients > 0
      ? 100
      : 0;

  const totalClients = new Set(invoices.map((inv) => inv.clientName)).size;

  // Revenus - Mois actuel vs mois précédent
  const currentMonthRevenue = invoices
    .filter((inv) => {
      const invDate = new Date(inv.invoiceDate);
      return (
        invDate.getMonth() === currentMonth &&
        invDate.getFullYear() === currentYear &&
        inv.paymentStatus === "PAID"
      );
    })
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  const lastMonthRevenue = invoices
    .filter((inv) => {
      const invDate = new Date(inv.invoiceDate);
      return (
        invDate.getMonth() === lastMonth &&
        invDate.getFullYear() === lastMonthYear &&
        inv.paymentStatus === "PAID"
      );
    })
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : currentMonthRevenue > 0
      ? 100
      : 0;

  const totalRevenue = invoices
    .filter((inv) => inv.paymentStatus === "PAID")
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  // Factures payées - Mois actuel vs mois précédent
  const currentMonthPaid = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return (
      invDate.getMonth() === currentMonth &&
      invDate.getFullYear() === currentYear &&
      inv.paymentStatus === "PAID"
    );
  }).length;

  const lastMonthPaid = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return (
      invDate.getMonth() === lastMonth &&
      invDate.getFullYear() === lastMonthYear &&
      inv.paymentStatus === "PAID"
    );
  }).length;

  const paidGrowth =
    lastMonthPaid > 0
      ? ((currentMonthPaid - lastMonthPaid) / lastMonthPaid) * 100
      : currentMonthPaid > 0
      ? 100
      : 0;

  const paidInvoices = invoices.filter((inv) => inv.paymentStatus === "PAID").length;

  // Factures en retard - Mois actuel vs mois précédent
  const currentMonthOverdue = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return (
      invDate.getMonth() === currentMonth &&
      invDate.getFullYear() === currentYear &&
      inv.paymentStatus === "OVERDUE"
    );
  }).length;

  const lastMonthOverdue = invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate);
    return (
      invDate.getMonth() === lastMonth &&
      invDate.getFullYear() === lastMonthYear &&
      inv.paymentStatus === "OVERDUE"
    );
  }).length;

  const overdueGrowth =
    lastMonthOverdue > 0
      ? ((currentMonthOverdue - lastMonthOverdue) / lastMonthOverdue) * 100
      : currentMonthOverdue > 0
      ? 100
      : 0;

  const overdueInvoices = invoices.filter(
    (inv) => inv.paymentStatus === "OVERDUE"
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const stats = [
    {
      label: "Clients",
      value: formatNumber(totalClients),
      growth: clientsGrowth,
      growthLabel: "vs mois dernier",
      color: "blue",
      icon: Users,
    },
    {
      label: "Revenus",
      value: formatCurrency(totalRevenue),
      growth: revenueGrowth,
      growthLabel: "vs mois dernier",
      color: "green",
      icon: DollarSign,
    },
    {
      label: "Factures payées",
      value: formatNumber(paidInvoices),
      growth: paidInvoices > 0 ? (paidInvoices / invoices.length) * 100 : 0,
      growthLabel: "taux global",
      color: "purple",
      icon: FileText,
      isPercentage: true,
    },
    {
      label: "Factures en retard",
      value: formatNumber(overdueInvoices),
      growth: overdueInvoices > 0 ? (overdueInvoices / invoices.length) * 100 : 0,
      growthLabel: "du total",
      color: "red",
      icon: FileText,
      isPercentage: true,
      invertColors: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        blue: {
          bg: "bg-blue-400",
          text: "text-blue-600",
          border: "border-blue-500",
        },
        green: {
          bg: "bg-green-400",
          text: "text-green-600",
          border: "border-green-500",
        },
        purple: {
          bg: "bg-purple-400",
          text: "text-purple-600",
          border: "border-purple-500",
        },
        red: {
          bg: "bg-red-400",
          text: "text-red-600",
          border: "border-red-500",
        },
      };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        return (
          <div
            key={index}
            className="bg-card rounded-xl border border-themed p-5 hover:shadow-lg transition-all duration-200"
          >
            {/* Icon et Label */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 ${colors.bg} bg-opacity-10 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${colors.text} `} />
              </div>
              <span className="text-sm font-semibold text-primary">
                {stat.label}
              </span>
            </div>

            {/* Valeur principale */}
            <div className="mb-3">
              <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
            </div>

            {/* Croissance */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {!stat.isPercentage && (
                  <TrendingUp
                    className={`h-4 w-4 ${
                      stat.invertColors
                        ? stat.growth <= 0
                          ? "text-green-500"
                          : "text-red-500 rotate-180"
                        : stat.growth >= 0
                        ? "text-green-500"
                        : "text-red-500 rotate-180"
                    }`}
                  />
                )}
                <span
                  className={`text-sm font-semibold ${
                    stat.isPercentage
                      ? "text-secondary"
                      : stat.invertColors
                      ? stat.growth <= 0
                        ? "text-green-600"
                        : "text-red-600"
                      : stat.growth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {!stat.isPercentage && stat.growth >= 0 ? "+" : ""}
                  {stat.growth.toFixed(stat.isPercentage ? 1 : 2)}%
                </span>
              </div>
              <span className="text-xs text-muted">{stat.growthLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
