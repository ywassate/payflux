import Wrapper from "@/app/components/Wrapper";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { FileText, Plus, MessageSquare } from "lucide-react";
import Link from "next/link";
import InvoiceStatusChart from "../components/InvoiceStatusChart";
import CategoryPieChart from "../components/CategoryPieChart";
import InvoiceDashboard from "../components/InvoiceDashboard";
import { getCategories } from "../actions";

const prisma = new PrismaClient();

export default async function InvoicesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Récupérer l'utilisateur et son rôle
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user.role === "ADMIN";

  // Récupérer les factures
  // Admin: toutes les factures
  // Client: factures avec lifecycle=SENT ou lifecycle=CLOSED (tous paymentStatus)
  const invoices = await prisma.invoice.findMany({
    where: isAdmin
      ? {}
      : {
          userId: userId,
          lifecycle: {
            in: ["SENT", "CLOSED"]
          }
        },
    include: {
      category: true,
      createdById: true,
      lines: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await getCategories();

  // Récupérer l'admin pour le lien de contact
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  return (
    <Wrapper>
      <div className="space-y-8">
        {/* Header moderne */}
        <div className="bg-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <FileText className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Mes Factures</h1>
                <p className="text-blue-100 text-lg">
                  {isAdmin
                    ? "Gérez toutes les factures"
                    : "Consultez vos factures"}
                </p>
              </div>
            </div>
            {isAdmin ? (
              <Link
                href="/invoices/new"
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 w-fit"
              >
                <Plus className="h-5 w-5" />
                Nouvelle facture
              </Link>
            ) : (
              <Link
                href={`/chat${admin ? `?clientId=${user.id}` : ""}`}
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 w-fit"
              >
                <MessageSquare className="h-5 w-5" />
                Contacter l'admin
              </Link>
            )}
          </div>
        </div>

        {/* Répartition par statut et graphique */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Répartition par statut */}
          <div className="lg:col-span-2">
            <InvoiceStatusChart invoices={invoices as any} isAdmin={isAdmin} />
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-1">
            <CategoryPieChart invoices={invoices as any} />
          </div>
        </div>

        {/* Liste des factures */}
        <div className="bg-card rounded-xl border border-themed p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Toutes les factures
              </h2>
              <p className="text-sm text-muted">
                Gérez et suivez toutes vos factures
              </p>
            </div>
          </div>

          <InvoiceDashboard
            initialInvoices={invoices as any}
            categories={categories}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </Wrapper>
  );
}
