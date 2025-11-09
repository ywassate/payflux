import { resend, FROM_ADDRESS } from "./resend";
import InvoiceSentEmail from "./templates/InvoiceSent";
import InvoicePaidEmail from "./templates/InvoicePaid";
import NewMessageEmail from "./templates/NewMessageEmail";
import InvoiceReminderEmail from "./templates/InvoiceReminderEmail";
import InvoiceOverdueEmail from "./templates/InvoiceOverdueEmail";
import * as React from "react";

// Type pour les réponses d'envoi d'email
interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envoie un email de notification de facture envoyée
 */
export async function sendInvoiceSentEmail(params: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  dueDate: string;
  invoiceUrl: string;
  pdfUrl: string;
}): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Nouvelle facture ${params.invoiceNumber} - PayFlux`,
      react: React.createElement(InvoiceSentEmail, {
        invoiceNumber: params.invoiceNumber,
        clientName: params.clientName,
        totalTTC: params.totalTTC,
        dueDate: params.dueDate,
        invoiceUrl: params.invoiceUrl,
        pdfUrl: params.pdfUrl,
      }),
    });

    if (error) {
      console.error("Erreur d'envoi d'email (facture envoyée):", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Exception lors de l'envoi d'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Envoie un email de confirmation de paiement
 */
export async function sendInvoicePaidEmail(params: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  paidDate: string;
  invoiceUrl: string;
  pdfUrl: string;
}): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `✅ Paiement confirmé - Facture ${params.invoiceNumber}`,
      react: React.createElement(InvoicePaidEmail, {
        invoiceNumber: params.invoiceNumber,
        clientName: params.clientName,
        totalTTC: params.totalTTC,
        paidDate: params.paidDate,
        invoiceUrl: params.invoiceUrl,
        pdfUrl: params.pdfUrl,
      }),
    });

    if (error) {
      console.error("Erreur d'envoi d'email (facture payée):", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Exception lors de l'envoi d'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Envoie un email de notification de nouveau message
 */
export async function sendNewMessageEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
  isAdmin: boolean;
}): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `💬 Nouveau message de ${params.senderName}`,
      react: React.createElement(NewMessageEmail, {
        recipientName: params.recipientName,
        senderName: params.senderName,
        messagePreview: params.messagePreview,
        conversationUrl: params.conversationUrl,
        isAdmin: params.isAdmin,
      }),
    });

    if (error) {
      console.error("Erreur d'envoi d'email (nouveau message):", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Exception lors de l'envoi d'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Envoie un email de rappel avant échéance (3 jours avant)
 */
export async function sendInvoiceReminderEmail(params: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  dueDate: string;
  daysRemaining: number;
  invoiceUrl: string;
  pdfUrl: string;
}): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `🔔 Rappel - Facture ${params.invoiceNumber} à échéance dans ${params.daysRemaining} jours`,
      react: React.createElement(InvoiceReminderEmail, {
        invoiceNumber: params.invoiceNumber,
        clientName: params.clientName,
        totalTTC: params.totalTTC,
        dueDate: params.dueDate,
        daysRemaining: params.daysRemaining,
        invoiceUrl: params.invoiceUrl,
        pdfUrl: params.pdfUrl,
      }),
    });

    if (error) {
      console.error("Erreur d'envoi d'email (rappel):", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Exception lors de l'envoi d'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Envoie un email de notification de facture en retard
 */
export async function sendInvoiceOverdueEmail(params: {
  to: string;
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  dueDate: string;
  daysOverdue: number;
  invoiceUrl: string;
  pdfUrl: string;
}): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `⚠️ URGENT - Facture ${params.invoiceNumber} en retard de ${params.daysOverdue} jour${params.daysOverdue > 1 ? "s" : ""}`,
      react: React.createElement(InvoiceOverdueEmail, {
        invoiceNumber: params.invoiceNumber,
        clientName: params.clientName,
        totalTTC: params.totalTTC,
        dueDate: params.dueDate,
        daysOverdue: params.daysOverdue,
        invoiceUrl: params.invoiceUrl,
        pdfUrl: params.pdfUrl,
      }),
    });

    if (error) {
      console.error("Erreur d'envoi d'email (facture en retard):", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Exception lors de l'envoi d'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Fonction utilitaire pour calculer les jours restants avant échéance
 */
export function calculateDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Fonction utilitaire pour calculer les jours de retard
 */
export function calculateDaysOverdue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
