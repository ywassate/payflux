"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";

export async function updateInvoiceAction(id: string, formData: any) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Non authentifié");
  }

  try {
    // Calculer les totaux
    const totalHT = formData.lines.reduce(
      (sum: number, line: any) => sum + line.quantity * line.unitPrice,
      0
    );
    const totalTVA = formData.vatActive
      ? (totalHT * formData.vatRate) / 100
      : 0;
    const totalTTC = totalHT + totalTVA;

    // Supprimer les anciennes lignes
    await prisma.invoiceLine.deleteMany({
      where: { invoiceId: id },
    });

    // Mettre à jour la facture avec les nouvelles lignes
    await prisma.invoice.update({
      where: { id },
      data: {
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
        lifecycle: formData.lifecycle,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
        categoryId: formData.categoryId || null,
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
    console.error("Erreur lors de la mise à jour de la facture:", error);
    throw error;
  }
}