import React from "react";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { TrendingUp, Mail, Lock } from "lucide-react";

const page = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Left side - Branding Card */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-blue-600 rounded-2xl shadow-xl p-12 text-white space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Image
                  src="/logo_payflux.png"
                  alt="PayFlux"
                  width={40}
                  height={40}
                />
              </div>
              <h1 className="text-3xl font-bold">PayFlux</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold leading-tight">
                Bienvenue sur PayFlux
              </h2>
              <p className="text-blue-100 text-lg">
                La solution complète pour gérer vos factures professionnelles
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg mt-1">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Dashboard intuitif</h3>
                  <p className="text-blue-100 text-sm">
                    Suivez vos revenus et statistiques en temps réel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Emails automatisés</h3>
                  <p className="text-blue-100 text-sm">
                    Envoi et rappels de factures automatiques
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg mt-1">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sécurisé et fiable</h3>
                  <p className="text-blue-100 text-sm">
                    Vos données sont protégées et cryptées
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Card */}
        <div className="flex flex-col justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <div className="p-3 bg-blue-600 rounded-xl mb-4">
                <Image
                  src="/logo_payflux.png"
                  alt="PayFlux"
                  width={50}
                  height={50}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PayFlux</h1>
            </div>

            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-600">
                Accédez à votre espace de gestion
              </p>
            </div>

            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-transparent p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-all",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary:
                    "bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold py-3 shadow-lg hover:shadow-xl transition-all",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium hover:underline",
                  formFieldInput:
                    "border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-4 py-3",
                  formFieldLabel: "text-gray-700 font-medium mb-2",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                  footerAction: "mt-6",
                  footer: "bg-transparent",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
