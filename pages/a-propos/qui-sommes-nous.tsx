import React from "react";
import Layout from "../../components/layout";
import Container from "../../components/container";

const QuiQommesNous = () => {
  return (
    <Layout>
      <Container>
        <article>
          <h1 className="text-4xl font-bold p-5">À propos de Afrikipresse</h1>
          <div>
            <p className="p-3 text-lg">
              Afrikipresse est un média d&apos;information qui couvre des sujets
              relatifs à l&apos;Afrique. Afrikipresse traite d&apos;une variété
              de sujets, y compris la politique, l&apos;économie, la société, la
              culture, et le sport en Afrique.
            </p>
            <p className="p-3 text-lg">
              Afrikipresse média vise à fournir des informations et des analyses
              approfondies sur des événements et des sujets d&apos;actualité en
              Afrique, en se concentrant souvent sur des perspectives
              africaines.
            </p>

            <p className="p-3 text-lg">
              Afrikipresse opère principalement en ligne, offrant un accès
              facile à ses contenus via son site web et potentiellement ses
              comptes sur les réseaux sociaux. Son public cible inclut non
              seulement les lecteurs en Afrique, et hors du continent, mais
              aussi ceux qui sont intéressés par les affaires africaines à
              l&apos;échelle mondiale. Le contenu est généralement en français,
              Afrikipresse compte jouer un rôle important dans la représentation
              des perspectives africaines dans le paysage médiatique global et
              dans la fourniture d&apos;informations essentielles sur le
              continent.
            </p>
          </div>
        </article>
      </Container>
    </Layout>
  );
};

export default QuiQommesNous;
