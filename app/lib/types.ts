import { InvoiceLifecycle, InvoicePaymentStatus } from "@prisma/client";

export type InvoiceWithDetails = {
  id: string;
  invoiceNumber: string;
  name: string;
  clientName: string;
  clientEmail: string;
  lifecycle: InvoiceLifecycle;
  paymentStatus: InvoicePaymentStatus;
  sentAt: Date | null;
  invoiceDate: Date;
  dueDate: Date;
  totalTTC: number;
  userId: string;
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

// Labels pour le cycle de vie
export const LIFECYCLE_LABELS: Record<InvoiceLifecycle, string> = {
  DRAFT: "Brouillon",
  APPROVED: "Approuvée",
  SENT: "Envoyée",
  CLOSED: "Clôturée",
};

// Labels pour le statut de paiement
export const PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  PENDING: "En attente",
  PARTIAL: "Paiement partiel",
  PROCESSING: "En traitement",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
  REJECTED: "Contestée",
};

export type InvoicePDFData = {
  invoiceNumber: string;
  name: string;
  lifecycle: string;
  paymentStatus: string;
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

// Couleurs pour le cycle de vie
export const LIFECYCLE_COLORS: Record<InvoiceLifecycle, string> = {
  DRAFT: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  APPROVED: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  CLOSED: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

// Couleurs pour le statut de paiement
export const PAYMENT_STATUS_COLORS: Record<InvoicePaymentStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  PARTIAL: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  OVERDUE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  REFUNDED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

// Fonction helper pour obtenir le label combiné
export function getInvoiceDisplayStatus(invoice: InvoiceWithDetails): string {
  // Si la facture est clôturée, afficher seulement le statut de paiement
  if (invoice.lifecycle === "CLOSED") {
    return PAYMENT_STATUS_LABELS[invoice.paymentStatus];
  }

  // Si la facture est envoyée, afficher le statut de paiement
  if (invoice.lifecycle === "SENT") {
    return PAYMENT_STATUS_LABELS[invoice.paymentStatus];
  }

  // Sinon afficher le cycle de vie
  return LIFECYCLE_LABELS[invoice.lifecycle];
}

// Fonction helper pour obtenir la couleur combinée
export function getInvoiceDisplayColor(invoice: InvoiceWithDetails): string {
  // Si la facture est clôturée ou envoyée, utiliser la couleur du statut de paiement
  if (invoice.lifecycle === "CLOSED" || invoice.lifecycle === "SENT") {
    return PAYMENT_STATUS_COLORS[invoice.paymentStatus];
  }

  // Sinon utiliser la couleur du cycle de vie
  return LIFECYCLE_COLORS[invoice.lifecycle];
}
