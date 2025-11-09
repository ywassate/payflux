import React from "react";
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { Zap, Shield, Users } from "lucide-react";

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
                Commencez gratuitement
              </h2>
              <p className="text-blue-100 text-lg">
                Créez votre compte et gérez vos factures en toute simplicité
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg mt-1">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Configuration rapide</h3>
                  <p className="text-blue-100 text-sm">
                    Créez votre première facture en moins de 5 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg mt-1">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">100% sécurisé</h3>
                  <p className="text-blue-100 text-sm">
                    Vos données sont cryptées et protégées
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-white/10 rounded-lg mt-1">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Support dédié</h3>
                  <p className="text-blue-100 text-sm">
                    Une équipe à votre écoute pour vous accompagner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Card */}
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
              <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
              <p className="text-gray-600">
                Commencez à gérer vos factures dès maintenant
              </p>
            </div>

            <SignUp
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
