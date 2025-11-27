import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../../@/components/ui/button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  LogIn,
  UserPlus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Head from "next/head";

export default function ConnexionPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Formulaire inscription
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("Côte d'Ivoire");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Rediriger vers abonnement si connecté
        const redirectUrl = router.query.redirect as string;
        router.push(redirectUrl || "/abonnement");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, "users", userId), {
        email,
        nom,
        prenom,
        telephone,
        ville,
        pays,
        createdAt: serverTimestamp(),
        subscriptionStatus: "inactive",
        subscriptionType: null,
        subscriptionEndDate: null,
      });

      toast.success("Compte créé avec succès ! Redirection...");
      router.push("/abonnement");
    } catch (error: any) {
      console.error("Erreur inscription:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Cette adresse email est déjà utilisée");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Adresse email invalide");
      } else if (error.code === "auth/configuration-not-found") {
        toast.error(
          "⚠️ Firebase Authentication n'est pas configuré. Veuillez activer l'authentification par email/mot de passe dans la console Firebase.",
          { duration: 8000 }
        );
      } else {
        toast.error(`Erreur lors de la création du compte: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Connexion réussie ! Redirection...");
      const redirectUrl = router.query.redirect as string;
      router.push(redirectUrl || "/abonnement");
    } catch (error: any) {
      console.error("Erreur connexion:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Email ou mot de passe incorrect");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Adresse email invalide");
      } else if (error.code === "auth/configuration-not-found") {
        toast.error(
          "⚠️ Firebase Authentication n'est pas configuré. Veuillez activer l'authentification par email/mot de passe dans la console Firebase.",
          { duration: 8000 }
        );
      } else {
        toast.error(`Erreur lors de la connexion: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userId = result.user.uid;

      // Vérifier si le profil existe déjà
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        // Créer le profil depuis Google
        await setDoc(doc(db, "users", userId), {
          email: result.user.email,
          nom: result.user.displayName?.split(" ").pop() || "",
          prenom: result.user.displayName?.split(" ")[0] || "",
          telephone: result.user.phoneNumber || "",
          ville: "",
          pays: "",
          createdAt: serverTimestamp(),
          subscriptionStatus: "inactive",
          subscriptionType: null,
          subscriptionEndDate: null,
        });
      }

      toast.success("Connexion Google réussie !");
      router.push("/abonnement");
    } catch (error: any) {
      console.error("Erreur Google Sign-In:", error);
      if (error.code === "auth/configuration-not-found") {
        toast.error(
          "⚠️ Firebase Authentication n'est pas configuré. Veuillez activer la connexion Google dans la console Firebase.",
          { duration: 8000 }
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.error("Connexion annulée");
      } else {
        toast.error(
          `Erreur lors de la connexion avec Google: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          {isLogin ? "Connexion" : "Créer un compte"} - Afrikipresse
        </title>
        <meta
          name="description"
          content="Accédez à vos contenus premium Afrikipresse"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo & Titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {isLogin ? "Bon retour !" : "Créer un compte"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Connectez-vous pour accéder à vos contenus premium"
                : "Rejoignez-nous pour profiter de nos contenus exclusifs"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Toggle Login/Signup */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  isLogin
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Connexion
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  !isLogin
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Inscription
              </button>
            </div>

            {/* Formulaire */}
            <form
              onSubmit={isLogin ? handleLogin : handleSignup}
              className="space-y-4"
            >
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={ville}
                          onChange={(e) => setVille(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="Abidjan"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pays *
                      </label>
                      <select
                        value={pays}
                        onChange={(e) => setPays(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="Côte d'Ivoire">
                          Côte d&apos;Ivoire
                        </option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Mali">Mali</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Bénin">Bénin</option>
                        <option value="Togo">Togo</option>
                        <option value="Niger">Niger</option>
                        <option value="France">France</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold py-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : isLogin ? (
                  "Se connecter"
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Ou continuer avec
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:underline font-semibold">
              Conditions d&apos;utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-600 hover:underline font-semibold">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
