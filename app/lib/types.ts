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
  DRAFT: "badge-neutral",
  APPROVED: "badge-info",
  SENT: "badge-primary",
  PARTIAL: "badge-warning",
  PAID: "badge-success",
  OVERDUE: "badge-error",
  CANCELLED: "badge-ghost",
  REFUNDED: "badge-secondary",
  REJECTED: "badge-error",
  PROCESSING: "badge-accent",
};
