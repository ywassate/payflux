import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  sendInvoiceReminderEmail,
  calculateDaysUntilDue,
} from "@/app/lib/email/send-emails";

const prisma = new PrismaClient();

/**
 * Cron job pour envoyer des rappels 3 jours avant l'échéance
 * Cette route doit être appelée quotidiennement par Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le token d'authentification pour sécuriser l'endpoint
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculer la date cible (aujourd'hui + 3 jours)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 3);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Trouver toutes les factures envoyées, non payées, avec échéance dans 3 jours
    const invoices = await prisma.invoice.findMany({
      where: {
        lifecycle: "SENT",
        paymentStatus: {
          in: ["PENDING", "PARTIAL"],
        },
        dueDate: {
          gte: targetDate,
          lt: nextDay,
        },
        clientEmail: {
          not: "",
        },
      },
      include: {
        createdById: true,
      },
    });

    console.log(`Found ${invoices.length} invoices for reminders`);

    const results = [];

    // Envoyer un rappel pour chaque facture
    for (const invoice of invoices) {
      if (!invoice.clientEmail) continue;

      const daysRemaining = calculateDaysUntilDue(invoice.dueDate);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const invoiceUrl = `${baseUrl}/invoices/${invoice.id}`;
      const pdfUrl = `${baseUrl}/api/invoices/${invoice.id}/pdf`;

      try {
        const result = await sendInvoiceReminderEmail({
          to: invoice.clientEmail,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          totalTTC: invoice.totalTTC,
          dueDate: invoice.dueDate.toISOString(),
          daysRemaining,
          invoiceUrl,
          pdfUrl,
        });

        results.push({
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: invoice.clientEmail,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        console.error(
          `Error sending reminder for invoice ${invoice.invoiceNumber}:`,
          error
        );
        results.push({
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: invoice.clientEmail,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${invoices.length} invoice reminders`,
      results,
    });
  } catch (error) {
    console.error("Error in reminders cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
