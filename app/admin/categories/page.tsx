import Wrapper from "@/app/components/Wrapper";
import { getCategories, getCurrentUser } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CategoriesManager from "@/app/components/CategoriesManager";
import { FolderOpen } from "lucide-react";

export default async function CategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
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
      <div className="space-y-8">
        {/* Header moderne avec gradient */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <FolderOpen className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Catégories</h1>
              <p className="text-amber-100 text-lg">
                Organisez vos factures par catégories
              </p>
            </div>
          </div>
        </div>

        {/* Manager */}
        <CategoriesManager categories={categories as any} />
      </div>
    </Wrapper>
  );
}