import { InvoiceStatus } from "@prisma/client";

export type InvoiceWithDetails = {
  id: string;
  invoiceNumber: string;
  name: string;
  clientName: string;
  clientEmail: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate: Date;
  totalTTC: number;
  category: {
    id: string;
    name: string;
  } | null;
  createdById: {
    name: string;
    email: string;
  };
  lines: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Brouillon",
  APPROVED: "Approuvée",
  SENT: "Envoyée",
  PARTIAL: "Partiellement payée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
  REJECTED: "Rejetée",
  PROCESSING: "En traitement",
};
export type InvoicePDFData = {
  invoiceNumber: string;
  name: string;
  status: string;
  issuerName: string;
  issuerAddress: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  invoiceDate: Date;
  dueDate: Date;
  lines: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  vatActive: boolean;
  vatRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  notes?: string;
};

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  APPROVED: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PARTIAL: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  OVERDUE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  REFUNDED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  PROCESSING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
};
