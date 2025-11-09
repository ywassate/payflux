"use server";

import { PrismaClient, InvoiceLifecycle, InvoicePaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Vérifier si un email est dans la liste des admins
function isAdminEmail(email: string): boolean {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];

  return adminEmails.includes(email.toLowerCase());
}

export async function checkAndAddUser(email: string, name: string) {
  if (!email) return null;
  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user && name) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: isAdminEmail(email) ? "ADMIN" : undefined,
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error in checkAndAddUser:", error);
    return null;
  }
}
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

export async function addEmptyInvoice(email: string, name: string) {
  if (!email || !name) return;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found");
      return;
    }

    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        name: name,
        issuerName: "",
        issuerAddress: "",
        clientName: "",
        clientAddress: "",
        clientEmail: "",
        clientPhone: "",
        invoiceDate: new Date().toISOString(),
        dueDate,
        vatActive: false,
        vatRate: 20,
        lifecycle: InvoiceLifecycle.DRAFT,
        paymentStatus: InvoicePaymentStatus.PENDING,
        userId: user.id,
      },
    });

    revalidatePath("/");
    return invoice;
  } catch (error) {
    console.error("Error in addEmptyInvoice:", error);
    throw error;
  }
}

// Récupérer toutes les factures avec filtres
export async function getInvoices(filters?: {
  lifecycle?: InvoiceLifecycle;
  paymentStatus?: InvoicePaymentStatus;
  search?: string;
  categoryId?: string;
  userId?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.lifecycle) {
      where.lifecycle = filters.lifecycle;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search } },
        { name: { contains: filters.search } },
        { clientName: { contains: filters.search } },
        { clientEmail: { contains: filters.search } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        category: true,
        lines: true,
        createdById: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

// Récupérer une facture par ID
export async function getInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        category: true,
        lines: true,
        createdById: true,
      },
    });
    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
}

// Mettre à jour une facture
export async function updateInvoice(
  id: string,
  data: {
    name?: string;
    issuerName?: string;
    issuerAddress?: string;
    clientName?: string;
    clientAddress?: string;
    clientEmail?: string;
    clientPhone?: string;
    invoiceDate?: Date;
    dueDate?: Date;
    vatActive?: boolean;
    vatRate?: number;
    lifecycle?: InvoiceLifecycle;
    paymentStatus?: InvoicePaymentStatus;
    notes?: string;
    categoryId?: string | null;
  }
) {
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
      include: {
        lines: true,
        category: true,
      },
    });

    // Recalculer les totaux
    await recalculateInvoiceTotals(id);

    revalidatePath("/");
    return invoice;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}

// Supprimer une facture
export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}

// Ajouter une ligne de facture
export async function addInvoiceLine(
  invoiceId: string,
  data: {
    description: string;
    quantity: number;
    unitPrice: number;
  }
) {
  try {
    const line = await prisma.invoiceLine.create({
      data: {
        ...data,
        invoiceId,
      },
    });

    await recalculateInvoiceTotals(invoiceId);
    revalidatePath("/");
    return line;
  } catch (error) {
    console.error("Error adding invoice line:", error);
    throw error;
  }
}

// Mettre à jour une ligne de facture
export async function updateInvoiceLine(
  id: string,
  data: {
    description?: string;
    quantity?: number;
    unitPrice?: number;
  }
) {
  try {
    const line = await prisma.invoiceLine.update({
      where: { id },
      data,
    });

    if (line.invoiceId) {
      await recalculateInvoiceTotals(line.invoiceId);
    }

    revalidatePath("/");
    return line;
  } catch (error) {
    console.error("Error updating invoice line:", error);
    throw error;
  }
}

// Supprimer une ligne de facture
export async function deleteInvoiceLine(id: string, invoiceId: string) {
  try {
    await prisma.invoiceLine.delete({
      where: { id },
    });

    await recalculateInvoiceTotals(invoiceId);
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting invoice line:", error);
    throw error;
  }
}

// Recalculer les totaux d'une facture
async function recalculateInvoiceTotals(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lines: true },
    });

    if (!invoice) return;

    const totalHT = invoice.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );

    const totalTVA = invoice.vatActive ? (totalHT * invoice.vatRate) / 100 : 0;
    const totalTTC = totalHT + totalTVA;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        totalHT,
        totalTVA,
        totalTTC,
      },
    });
  } catch (error) {
    console.error("Error recalculating invoice totals:", error);
    throw error;
  }
}

// Créer une catégorie
export async function createCategory(name: string, description?: string) {
  try {
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });
    revalidatePath("/");
    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

// Récupérer toutes les catégories
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Changer le statut d'une facture
export async function changeInvoiceStatus(id: string, lifecycle: InvoiceLifecycle, paymentStatus: InvoicePaymentStatus) {
  try {
    // Récupérer l'ancien état de la facture
    const oldInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        createdById: true,
      }
    });

    if (!oldInvoice) {
      throw new Error("Invoice not found");
    }

    // Préparer les données de mise à jour
    const updateData: {
      lifecycle: InvoiceLifecycle;
      paymentStatus: InvoicePaymentStatus;
      sentAt?: Date;
    } = { lifecycle, paymentStatus };

    // Si le lifecycle passe à SENT et n'était pas SENT avant, définir sentAt
    if (lifecycle === "SENT" && oldInvoice.lifecycle !== "SENT" && !oldInvoice.sentAt) {
      updateData.sentAt = new Date();
    }

    // Mettre à jour la facture
    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        createdById: true,
      }
    });

    // Envoyer les emails si nécessaire (en arrière-plan, sans bloquer)
    sendInvoiceStatusEmails(oldInvoice, invoice).catch(error => {
      console.error("Error sending status change emails:", error);
    });

    revalidatePath("/");
    return invoice;
  } catch (error) {
    console.error("Error changing invoice status:", error);
    throw error;
  }
}

// Fonction d'envoi d'emails selon les changements de statut
async function sendInvoiceStatusEmails(
  oldInvoice: { lifecycle: InvoiceLifecycle; paymentStatus: InvoicePaymentStatus; clientEmail: string },
  newInvoice: {
    id: string;
    invoiceNumber: string;
    lifecycle: InvoiceLifecycle;
    paymentStatus: InvoicePaymentStatus;
    clientName: string;
    clientEmail: string;
    totalTTC: number;
    dueDate: Date;
    createdById: { name: string; email: string };
  }
) {
  if (!newInvoice.clientEmail) {
    console.log("No client email, skipping status emails");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://payflux.com";
  const invoiceUrl = `${baseUrl}/invoices/${newInvoice.id}`;
  const pdfUrl = `${baseUrl}/api/invoices/${newInvoice.id}/pdf`;

  // Import dynamique pour éviter les problèmes de dépendances circulaires
  const { sendInvoiceSentEmail, sendInvoicePaidEmail } = await import("./lib/email/send-emails");

  // Email de facture envoyée (lifecycle passe à SENT)
  if (newInvoice.lifecycle === "SENT" && oldInvoice.lifecycle !== "SENT") {
    console.log(`Sending invoice sent email for ${newInvoice.invoiceNumber}`);
    await sendInvoiceSentEmail({
      to: newInvoice.clientEmail,
      invoiceNumber: newInvoice.invoiceNumber,
      clientName: newInvoice.clientName,
      totalTTC: newInvoice.totalTTC,
      dueDate: newInvoice.dueDate.toISOString(),
      invoiceUrl,
      pdfUrl,
    });
  }

  // Email de confirmation de paiement (paymentStatus passe à PAID)
  if (newInvoice.paymentStatus === "PAID" && oldInvoice.paymentStatus !== "PAID") {
    console.log(`Sending invoice paid email for ${newInvoice.invoiceNumber}`);
    await sendInvoicePaidEmail({
      to: newInvoice.clientEmail,
      invoiceNumber: newInvoice.invoiceNumber,
      clientName: newInvoice.clientName,
      totalTTC: newInvoice.totalTTC,
      paidDate: new Date().toISOString(),
      invoiceUrl,
      pdfUrl,
    });
  }
}

// ============= GESTION DES UTILISATEURS (ADMIN ONLY) =============

// Récupérer tous les utilisateurs
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { email: "asc" },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Changer le rôle d'un utilisateur
export async function updateUserRole(userId: string, role: "ADMIN" | "CLIENT") {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/users");
    return user;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

// Supprimer un utilisateur
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Récupérer l'utilisateur courant avec son rôle
export async function getCurrentUser(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: clerkId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}
