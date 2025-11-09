"use client";

import { InvoiceWithDetails } from "../lib/types";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

interface InvoiceStatsProps {
  invoices: InvoiceWithDetails[];
}

export default function InvoiceStats({ invoices }: InvoiceStatsProps) {
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.paymentStatus === "PAID").length;
  const overdueInvoices = invoices.filter(
    (inv) => inv.paymentStatus === "OVERDUE"
  ).length;
  const totalRevenue = invoices
    .filter((inv) => inv.paymentStatus === "PAID")
    .reduce((sum, inv) => sum + inv.totalTTC, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="stat bg-base-200 rounded-lg">
        <div className="stat-figure text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <div className="stat-title">Total factures</div>
        <div className="stat-value text-primary">{totalInvoices}</div>
      </div>

      <div className="stat bg-base-200 rounded-lg">
        <div className="stat-figure text-success">
          <CheckCircle className="h-8 w-8" />
        </div>
        <div className="stat-title">Payées</div>
        <div className="stat-value text-success">{paidInvoices}</div>
      </div>

      <div className="stat bg-base-200 rounded-lg">
        <div className="stat-figure text-error">
          <Clock className="h-8 w-8" />
        </div>
        <div className="stat-title">En retard</div>
        <div className="stat-value text-error">{overdueInvoices}</div>
      </div>

      <div className="stat bg-base-200 rounded-lg">
        <div className="stat-figure text-accent">
          <DollarSign className="h-8 w-8" />
        </div>
        <div className="stat-title">Revenus</div>
        <div className="stat-value text-accent text-2xl">
          {formatCurrency(totalRevenue)}
        </div>
      </div>
    </div>
  );
}