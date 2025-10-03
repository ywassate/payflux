import Wrapper from "./components/Wrapper";
import ModernDashboardStats from "./components/ModernDashboardStats";
import SalesMetricsChart from "./components/SalesMetricsChart";
import RecentInvoices from "./components/RecentInvoices";
import InvoiceDashboard from "./components/InvoiceDashboard";
import prisma from "./lib/prisma";
import CategoryPieChart from "./components/CategoryPieChart";
import { getInvoices, getCategories } from "./actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  // Vérifier l'authentification
  const sessionUser = await currentUser();

  if (!sessionUser) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Veuillez vous connecter
            </h1>
            <p className="text-secondary">
              Connectez-vous pour accéder à votre dashboard
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  // Récupérer ou créer l'utilisateur dans Prisma
  let user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  // Si l'utilisateur n'existe pas dans Prisma, le créer
  if (!user) {
    const email = sessionUser.emailAddresses[0]?.emailAddress || "";
    const name = sessionUser.firstName && sessionUser.lastName
      ? `${sessionUser.firstName} ${sessionUser.lastName}`
      : sessionUser.username || email;

    // Vérifier si c'est un email admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    user = await prisma.user.create({
      data: {
        id: sessionUser.id,
        email,
        name,
        role: isAdminEmail ? "ADMIN" : "CLIENT",
      },
    });
  }

  const invoices = await getInvoices(
    user.role === "CLIENT" ? { userId: user.id } : {}
  );
  const categories = await getCategories();

  const isAdmin = user.role === "ADMIN";

  // Rediriger les clients vers la page des factures
  if (!isAdmin) {
    redirect("/invoices");
  }

  // Dashboard Admin (existant)
  return (
    <Wrapper>
      <div className="space-y-8">
        {/* Header moderne */}
        <div className="bg-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <TrendingUp className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                <p className="text-blue-100 text-lg">
                  Vue d'ensemble de votre activité
                </p>
              </div>
            </div>
            <Link
              href="/invoices/new"
              className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 w-fit"
            >
              <Plus className="h-5 w-5" />
              Nouvelle facture
            </Link>
          </div>
        </div>
        {/* Contenu principal en deux colonnes */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Colonne principale - 2/3 */}
            <div className="xl:col-span-2 flex flex-col gap-6 h-full">
              {/* Statistiques modernes style Nexus */}
              <ModernDashboardStats invoices={invoices} />
              <SalesMetricsChart invoices={invoices} />
            </div>

            {/* Colonne secondaire - 1/3 */}
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                <RecentInvoices invoices={invoices} />
              </div>
              <div className="flex-1">
                <CategoryPieChart invoices={invoices} />
              </div>
            </div>
          </div>
        </div>
        {/* Liste complète des factures */}
        <div className="bg-card rounded-xl border border-themed p-6">
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
            initialInvoices={invoices}
            categories={categories}
          />
        </div>
      </div>
    </Wrapper>
  );
}
