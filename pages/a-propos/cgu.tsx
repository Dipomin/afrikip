import { LocateIcon, Mail, MapPinIcon, PhoneIcon } from "lucide-react";
import React from "react";
import LayoutAbonne from "../../components/layout-abonne";
import Layout from "../../components/layout";

import Container from "../../components/container";

const CGU = ({ preview }) => {
  return (
    <Layout preview={preview}>
      <Container>
        <div>
          <div className="text-2xl lg:text-4xl font-black text-center p-10 text-black">
            Conditions Générales d&apos;Utilisation
          </div>
          <div className="">
            <div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Information générales
              </div>
              <div className="font-bold text-xl">Société</div>
              <div> Afrikipresse Multimédias</div> 2 rue du Président Willson,
              9200 Levallois Perret
              <div>Directeur de publication : Alafé Wakili</div>
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Hébergeurs
              </div>
              <div> Ligne Web Service (LWS)</div>
              <div></div>
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Conditions générales d’abonnement aux services de Afrikipresse
              </div>
              <div>
                {" "}
                Les présentes conditions générales d’abonnement en ligne vous
                sont proposées par la Société Afrikipresse Multimédias. Société
                par actions simplifiée dont le siège social est situé au 2 rue
                du Président Willson, 9200 Levallois Perret. Immatriculée au RCS
                Paris sous le Numéro ... .
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                I. Définitions et champs d’application
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                II. Modalités d’accès et d’abonnements
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Abonnement individuel
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Nos offres d’abonnement
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Renouvellement
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                III. Conditions tarifaires et paiements
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                IV. Nos services
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                V. Modifications des conditions générales
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                VI. Règles d’usage et limitation de responsabilité
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Limitations propres à l’utilisation du réseau Internet
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                VII. Dispositions diverses
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Droit de rétractation
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Suspension/résiliation de l’abonnement
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Pour résilier un abonnement individuel
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Propriété Intellectuelle
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                VIII. Lois & Juridictions applicables
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                Conditions d’Utilisation des sites Internet et applications de
                Afrikipresse Multimedias
              </div>
              <div className="text-xl lg:text-2xl font-extrabold">
                VIII. Lois & Juridictions applicables
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default CGU;
