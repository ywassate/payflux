"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import TopNavbar from "./TopNavbar";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-200">
      {/* Top horizontal navbar */}
      <TopNavbar onToggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Navbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay pour mobile/tablet quand sidebar ouvert */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal - s'adapte automatiquement avec le sidebar */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen && isLargeScreen ? "ml-[280px]" : "ml-0"
        }`}
      >
        <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 w-full max-w-full overflow-hidden">
          <div className="w-full max-w-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Wrapper;
