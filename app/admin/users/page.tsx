import Wrapper from "@/app/components/Wrapper";
import UsersTable from "@/app/components/UsersTable";
import { getAllUsers } from "@/app/actions";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Users, Shield, UserCog } from "lucide-react";

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    redirect("/sign-in");
  }

  // Vérifier si l'utilisateur est admin
  const currentUserData = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUserData || currentUserData.role !== "ADMIN") {
    redirect("/");
  }

  const users = await getAllUsers();

  // Récupérer les infos Clerk pour tous les utilisateurs (photos de profil)
  const client = await clerkClient();
  const usersWithImages = await Promise.all(
    users.map(async (user) => {
      try {
        const clerkUserData = await client.users.getUser(user.id);
        return {
          ...user,
          imageUrl: clerkUserData.imageUrl,
        };
      } catch (error) {
        return {
          ...user,
          imageUrl: null,
        };
      }
    })
  );

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;

  return (
    <Wrapper>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header moderne */}
        <div className="bg-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Shield className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestion des utilisateurs</h1>
              <p className="text-emerald-100 text-lg">
                Gérez les rôles et les permissions de votre équipe
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques modernes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-themed p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Total</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">{users.length}</div>
            <div className="text-sm text-secondary">Utilisateurs enregistrés</div>
          </div>

          <div className="bg-card rounded-xl border border-themed p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Admins</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">{adminCount}</div>
            <div className="text-sm text-secondary">Administrateurs actifs</div>
          </div>

          <div className="bg-card rounded-xl border border-themed p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <UserCog className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Clients</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">{clientCount}</div>
            <div className="text-sm text-secondary">Comptes clients</div>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="bg-card rounded-xl border border-themed p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    stroke="currentColor"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Permissions des rôles</h3>
              <div className="space-y-3 text-sm text-secondary">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900">Administrateur :</span> Accès complet - Création, modification et suppression de factures. Gestion des utilisateurs et des permissions.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCog className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-purple-900">Client :</span> Accès restreint - Consultation uniquement de ses propres factures.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table des utilisateurs */}
        <div className="bg-card rounded-xl shadow-sm border border-themed overflow-hidden">
          <div className="bg-base-200 px-8 py-6 border-b border-themed">
            <h2 className="text-2xl font-bold text-primary">Liste des utilisateurs</h2>
            <p className="text-secondary mt-1">Gérez les comptes et les rôles</p>
          </div>
          <div className="p-8">
            <UsersTable users={usersWithImages as any} currentUserId={userId} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
}