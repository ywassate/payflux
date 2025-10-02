"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

export async function createInvoice(formData: any) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Non authentifié");
  }

  try {
    const invoiceNumber = await generateInvoiceNumber();

    // Calculer les totaux
    const totalHT = formData.lines.reduce(
      (sum: number, line: any) => sum + line.quantity * line.unitPrice,
      0
    );
    const totalTVA = formData.vatActive
      ? (totalHT * formData.vatRate) / 100
      : 0;
    const totalTTC = totalHT + totalTVA;

    // Créer la facture avec ses lignes
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        name: formData.name,
        issuerName: formData.issuerName,
        issuerAddress: formData.issuerAddress,
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        vatActive: formData.vatActive,
        vatRate: formData.vatRate,
        status: formData.status,
        notes: formData.notes,
        categoryId: formData.categoryId || null,
        userId: userId,
        totalHT,
        totalTVA,
        totalTTC,
        lines: {
          create: formData.lines.map((line: any) => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        },
      },
    });

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    throw error;
  }
}