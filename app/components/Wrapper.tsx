import React from "react";
import Navbar from "./Navbar";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div className="min-h-screen">
      {/* Navbar avec sidebar desktop et menu mobile */}
      <Navbar />

      {/* Contenu principal - commence après le header mobile fixe */}
      <main className="pt-14 lg:pt-0 lg:ml-64">
        <div className="px-6 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Wrapper;
