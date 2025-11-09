import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById } from "@/app/actions";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePDFTemplate } from "@/app/lib/pdf-template";
import { Readable } from "stream";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    // Générer le PDF
    const stream = await renderToStream(
      InvoicePDFTemplate({ invoice: invoice as any })
    );

    // Convertir le stream en Buffer
    const chunks: Buffer[] = [];
    const readable = Readable.from(stream as any);

    for await (const chunk of readable) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    // Retourner le PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}