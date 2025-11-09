import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  sendInvoiceOverdueEmail,
  calculateDaysOverdue,
} from "@/app/lib/email/send-emails";

const prisma = new PrismaClient();

/**
 * Cron job pour envoyer des notifications de factures en retard
 * Cette route doit être appelée quotidiennement par Vercel Cron
 * Envoie une notification pour les factures à J+1, J+7, J+14, J+30
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le token d'authentification pour sécuriser l'endpoint
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Trouver toutes les factures envoyées, non payées, avec échéance dépassée
    const invoices = await prisma.invoice.findMany({
      where: {
        lifecycle: "SENT",
        paymentStatus: {
          in: ["PENDING", "PARTIAL", "OVERDUE"],
        },
        dueDate: {
          lt: today,
        },
        clientEmail: {
          not: "",
        },
      },
      include: {
        createdById: true,
      },
    });

    console.log(`Found ${invoices.length} overdue invoices`);

    const results = [];

    // Jours pour lesquels on envoie des rappels (J+1, J+7, J+14, J+30)
    const reminderDays = [1, 7, 14, 30];

    // Envoyer une notification pour chaque facture en retard
    for (const invoice of invoices) {
      if (!invoice.clientEmail) continue;

      const daysOverdue = calculateDaysOverdue(invoice.dueDate);

      // Vérifier si c'est un jour de rappel
      if (!reminderDays.includes(daysOverdue)) {
        console.log(
          `Skipping invoice ${invoice.invoiceNumber} - ${daysOverdue} days overdue (not a reminder day)`
        );
        continue;
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const invoiceUrl = `${baseUrl}/invoices/${invoice.id}`;
      const pdfUrl = `${baseUrl}/api/invoices/${invoice.id}/pdf`;

      try {
        // Marquer comme OVERDUE si ce n'est pas déjà fait
        if (invoice.paymentStatus !== "OVERDUE") {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { paymentStatus: "OVERDUE" },
          });
        }

        const result = await sendInvoiceOverdueEmail({
          to: invoice.clientEmail,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          totalTTC: invoice.totalTTC,
          dueDate: invoice.dueDate.toISOString(),
          daysOverdue,
          invoiceUrl,
          pdfUrl,
        });

        results.push({
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: invoice.clientEmail,
          daysOverdue,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        console.error(
          `Error sending overdue notification for invoice ${invoice.invoiceNumber}:`,
          error
        );
        results.push({
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: invoice.clientEmail,
          daysOverdue,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} overdue invoice notifications (out of ${invoices.length} overdue invoices)`,
      results,
    });
  } catch (error) {
    console.error("Error in overdue cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
