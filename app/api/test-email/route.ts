import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceSentEmail } from "@/app/lib/email/send-emails";

export async function GET(request: NextRequest) {
  try {
    const result = await sendInvoiceSentEmail({
      to: "yassine.wass12@gmail.com", // Email du compte Resend
      invoiceNumber: "INV-2025-TEST",
      clientName: "Test Client",
      totalTTC: 1500.50,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      invoiceUrl: "http://localhost:3000/invoices/test-123",
      pdfUrl: "http://localhost:3000/api/invoices/test-123/pdf",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully!",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
