import { renderToStream } from "@react-pdf/renderer";
import { InvoicePDFTemplate } from "./pdf-template";

export async function generateInvoicePDF(invoiceData: any) {
  const stream = await renderToStream(
    InvoicePDFTemplate({ invoice: invoiceData })
  );

  return stream;
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
