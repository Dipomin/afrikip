"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import UserHeader from "../../components/UserHeader";
import Layout from "../../components/layout";
import {
  Users as UsersIcon,
  Search,
  Loader2,
  AlertCircle,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  UserCog,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../../@/components/ui/button";
import toast from "react-hot-toast";

interface UserData {
  id?: string;
  role?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  createdAt?: any;
  subscriptionStatus?: string;
}

interface AdminUserData {
  role?: string;
  nom?: string;
  prenom?: string;
}

export default function UsersManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const usersPerPage = 10;

  // Vérification authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setChecking(true);

      if (!currentUser) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        router.push("/connexion?redirect=/admin/users");
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          toast.error("Profil utilisateur introuvable");
          router.push("/");
          return;
        }

        const data = userDoc.data() as AdminUserData;

        if (data.role !== "ADMIN") {
          toast.error("Accès refusé : vous devez être administrateur");
          router.push("/");
          return;
        }

        setUser(currentUser);
        setAdminData(data);
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        toast.error("Erreur lors de la vérification des permissions");
        router.push("/");
      } finally {
        setChecking(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Chargement des utilisateurs
  useEffect(() => {
    if (user && adminData?.role === "ADMIN") {
      loadUsers();
    }
  }, [user, adminData]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData: UserData[] = [];

      usersSnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data(),
        } as UserData);
      });

      // Trier par date de création (plus récent en premier)
      usersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filtrage et recherche
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" ||
      u.role === roleFilter ||
      (!u.role && roleFilter === "USER");

    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Modifier le rôle
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      toast.success(`Rôle modifié en ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error("Erreur modification rôle:", error);
      toast.error("Erreur lors de la modification du rôle");
    }
  };

  // Supprimer utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      toast.success("Utilisateur supprimé avec succès");
      loadUsers();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Email",
      "Nom",
      "Prénom",
      "Rôle",
      "Téléphone",
      "Ville",
      "Pays",
      "Date création",
    ];
    const rows = filteredUsers.map((u) => [
      u.email || "",
      u.nom || "",
      u.prenom || "",
      u.role || "USER",
      u.telephone || "",
      u.ville || "",
      u.pays || "",
      u.createdAt?.toDate?.().toLocaleDateString("fr-FR") || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateurs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Badge rôle
  const getRoleBadge = (role?: string) => {
    if (role === "ADMIN") {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3" />
          ADMIN
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        USER
      </span>
    );
  };

  // Badge statut abonnement
  const getSubscriptionBadge = (status?: string) => {
    if (status === "active") {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Actif
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        <XCircle className="w-3 h-3" />
        Inactif
      </span>
    );
  };

  if (checking || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Vérification des permissions...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || adminData?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Accès Refusé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez être administrateur pour accéder à cette page.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <UserHeader
          user={user}
          userRole={adminData?.role}
          userName={`${adminData?.prenom || ""} ${adminData?.nom || ""}`}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push("/admin")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </Button>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestion des Utilisateurs
                  </h1>
                  <p className="text-gray-600">
                    {filteredUsers.length} utilisateur(s) trouvé(s)
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </Button>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.length}
                    </p>
                  </div>
                  <UsersIcon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter((u) => u.role === "ADMIN").length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter((u) => !u.role || u.role === "USER").length}
                    </p>
                  </div>
                  <UserIcon className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Abonnés actifs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        users.filter((u) => u.subscriptionStatus === "active")
                          .length
                      }
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par email, nom ou prénom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(e.target.value as "ALL" | "ADMIN" | "USER")
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Tous les rôles</option>
                    <option value="ADMIN">Admins uniquement</option>
                    <option value="USER">Utilisateurs uniquement</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Localisation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Abonnement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Inscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Aucun utilisateur trouvé
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {u.prenom?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {u.prenom} {u.nom}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                {u.telephone || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {u.ville && u.pays
                                  ? `${u.ville}, ${u.pays}`
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getRoleBadge(u.role)}
                            </td>
                            <td className="px-6 py-4">
                              {getSubscriptionBadge(u.subscriptionStatus)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(u.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => {
                                    const newRole =
                                      u.role === "ADMIN" ? "USER" : "ADMIN";
                                    handleRoleChange(u.id!, newRole);
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <UserCog className="w-4 h-4" />
                                  {u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                                </Button>
                                <Button
                                  onClick={() => handleDeleteUser(u.id!)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages} ({filteredUsers.length}{" "}
                    résultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
