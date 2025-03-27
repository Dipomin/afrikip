"use client";

import { useSupabase } from "../supabase-provider";
import { getURL } from "../../utils/helpers";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";
import Button from "../../components/button";

export default function AuthUI() {
  const { supabase } = useSupabase();

  // * Supabase Auth Error Message Translation
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
          return;

        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            (node.classList.contains("supabase-account-ui_ui-message") ||
              node.classList.contains("supabase-auth-ui_ui-message"))
          ) {
            const originErrorMessage = node.innerHTML.trim();

            let translatedErrorMessage = "<DEFAULT MESSAGE>";
            switch (originErrorMessage) {
              case "To signup, please provide your email":
                translatedErrorMessage =
                  "Pour créer un compte, veuillez indiquer votre adresse électronique";
                break;
              case "Signup requires a valid password":
                translatedErrorMessage =
                  "La création de compte nécessite un mot de passe valide";
                break;
              case "User already registered":
                translatedErrorMessage = "Utilisateur déjà enregistré";
                break;
              case "Only an email address or phone number should be provided on signup.":
                translatedErrorMessage =
                  "Seule une adresse électronique ou un numéro de téléphone doit être fourni lors de la création d'un compte.";
                break;
              case "Signups not allowed for this instance":
                translatedErrorMessage =
                  "La création de compte n'est pas autorisées pour cette instance";
                break;
              case "Email signups are disabled":
                translatedErrorMessage =
                  "La création de compte par adresse email est désactivées";
                break;
              case "Email link is invalid or has expired":
                translatedErrorMessage =
                  "Le lien de l'e-mail n'est pas valide ou a expiré";
                break;
              case "Token has expired or is invalid":
                translatedErrorMessage =
                  "Le jeton a expiré ou n'est pas valide";
                break;
              case "The new email address provided is invalid":
                translatedErrorMessage =
                  "La nouvelle adresse email fournie n'est pas valide";
                break;
              case "Password should be at least 6 characters":
                translatedErrorMessage =
                  "Le mot de passe doit comporter au moins 6 caractères";
                break;
              case "Invalid login credentials":
                translatedErrorMessage = "Informations de connexion invalides";
                break;
            }

            if (!document.querySelector("#auth-forgot-password")) {
              node.innerHTML = translatedErrorMessage;
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, []);

  return (
    <div className="flex flex-col">
      <Auth
        supabaseClient={supabase}
        providers={["github", "google", "facebook"]}
        redirectTo={`${getURL()}/auth/callback`}
        magicLink={true}
        socialLayout="horizontal"
        localization={{
          variables: {
            sign_in: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "Se connecter",
              password_input_placeholder: "Saisissez votre mot de passe",
              email_input_placeholder: "Saisissez votre adresse email",
              link_text:
                "Vous avez déjà un compte ? Cliquez ici pour vous connectez.",
              loading_button_label: "Connexion en cours ...",
            },
            sign_up: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              email_input_placeholder: "Saisissez votre adresse email",
              password_input_placeholder: "Saisissez un nouveau mot de passe",
              button_label: "Créer un compte",
              link_text: "Pas encore de compte? Cliquez-ici pour en créer",
              confirmation_text:
                "Vérifiez votre boite mail pour confirmer votre inscription.",
              loading_button_label: "Création en cours ...",
            },
            magic_link: {
              link_text: "Recevoir un lien de connexion",
              email_input_placeholder: "Votre adresse email",
              button_label: "Envoyer le lien",
              email_input_label: "Adresse email",
              confirmation_text: "Vérifiez votre boite email",
              loading_button_label: "Envoie en cours",
            },
            forgotten_password: {
              link_text: "Mot de passe oublié ?",
              button_label: "Réinitialiser",
              email_label: "Adresse email",
              email_input_placeholder: "Votre adresse email",
            },
          },
        }}
        //magicLink={true}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#b11414",
                brandAccent: "#757070",
                inputText: "#ffffff",
                inputPlaceholder: "#ffffff",
                inputLabelText: "#000000",
                anchorTextColor: "#ffffff",
                anchorTextHoverColor: "#b11414",
              },
            },
          },
        }}
        theme="light"
      />
    </div>
  );
}
