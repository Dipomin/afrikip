"use client";

import React from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Button } from "../@/components/ui/button";
import { User as UserIcon, LogOut, Shield, Mail, LogIn } from "lucide-react";
import toast from "react-hot-toast";

interface UserHeaderProps {
  user: User | null;
  userRole?: string | null;
  userName?: string | null;
}

export default function UserHeader({
  user,
  userRole,
  userName,
}: UserHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Déconnexion réussie");
      router.push("/connexion");
    } catch (error: any) {
      console.error("Erreur déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleLogin = () => {
    router.push("/connexion?redirect=/journal");
  };

  if (!user) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Non connecté
                </p>
                <p className="text-xs text-gray-500">
                  Connectez-vous pour accéder au dashboard
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <UserIcon className="w-6 h-6 text-white" />
            </div>

            {/* Informations utilisateur */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">
                  {userName || user.displayName || "Utilisateur"}
                </p>
                {userRole === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Shield className="w-3 h-3" />
                    ADMIN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
