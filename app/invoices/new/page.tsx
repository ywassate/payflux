import Wrapper from "@/app/components/Wrapper";
import InvoiceForm from "@/app/components/InvoiceForm";
import { getCategories, getCurrentUser } from "@/app/actions";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NewInvoicePage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    redirect("/sign-in");
  }

  // Vérifier que l'utilisateur est admin
  const user = await getCurrentUser(userId);
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await getCategories();

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto">
        <InvoiceForm
          categories={categories}
        />
      </div>
    </Wrapper>
  );
}