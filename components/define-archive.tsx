export default function comparerDateDeParution(articleDate: string): void {
  if (typeof articleDate === "string") {
    // Convertir la date de l'article en objet Date
    const dateArticle: globalThis.Date = new globalThis.Date(articleDate);

    // Date du 31 décembre 2021
    const dateLimite: globalThis.Date = new globalThis.Date("2021-12-31");

    // Comparer les dates
    if (dateArticle <= dateLimite) {
      console.log("L'article a été publié avant le 31 décembre 2021.");
    } else {
      console.log("L'article a été publié après le 31 décembre 2021.");
    }
  } else {
    console.error(
      "Erreur : La date de l'article n'est pas une chaîne de caractères valide."
    );
  }
}

// Exemple d'utilisation avec une date d'article fictive
const postDate: string = "2022-11-15";
comparerDateDeParution(postDate);

console.log(comparerDateDeParution(postDate));
