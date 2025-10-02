import Wrapper from "@/app/components/Wrapper";
import InvoiceForm from "@/app/components/InvoiceForm";
import { getCategories, getInvoiceById, getCurrentUser } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { updateInvoiceAction } from "./actions";

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Vérifier que l'utilisateur est admin
  const user = await getCurrentUser(userId);
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const invoice = await getInvoiceById(params.id);
  const categories = await getCategories();

  if (!invoice) {
    redirect("/");
  }

  // Préparer les données pour le formulaire
  const initialData = {
    id: invoice.id,
    name: invoice.name,
    issuerName: invoice.issuerName,
    issuerAddress: invoice.issuerAddress,
    clientName: invoice.clientName,
    clientAddress: invoice.clientAddress,
    clientEmail: invoice.clientEmail,
    clientPhone: invoice.clientPhone,
    invoiceDate: new Date(invoice.invoiceDate).toISOString().split("T")[0],
    dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
    vatActive: invoice.vatActive,
    vatRate: invoice.vatRate,
    status: invoice.status,
    notes: invoice.notes || "",
    categoryId: invoice.categoryId || "",
    lines: invoice.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
  };

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto">
        <InvoiceForm
          initialData={initialData}
          categories={categories}
          invoiceId={params.id}
        />
      </div>
    </Wrapper>
  );
}