import Head from "next/head";
//import { GetStaticProps } from "next";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/fr.json";

import {
  getAllPostsForHome,
  getEconomiePosts,
  getPolitiquePosts,
} from "../lib/api";
import Container from "../components/container";
import HeroPost from "../components/hero-post";
import Layout from "../components/layout";
import HomeNews2 from "../components/home-news2";
import HomeFive from "../components/home-five";
import HomePolitique from "../components/home-politique";
import PreviewCategorieHomeList from "../components/preview-categorie-home";
import HomeInterPreview from "../components/home-inter-preview";
import PreviewMini from "../components/preview-mini";
import AlertLast from "../components/alert-last";
import LintelligentTv from "../components/lintelligent-tv";
import ParisSportif from "../pubs/paris-sportif";
import PronosticFoot from "../pubs/pronostic-foot";
import { Meta } from "../components/meta";
import { GetStaticProps } from "next/types";

export default function Index({ allPosts: { edges }, preview }) {
  const morePostsOther = edges.slice(1);
  const newsTwo = edges[1]?.node;
  const newsThree = edges[2]?.node;
  const newsFour = edges.slice(3, 7);
  const newsFive = edges.slice(8, 10);
  const alertNews = edges.slice(0, 5);

  const [heroPost, setHeroPost] = useState(edges[0]?.node);
  const [politiquePosts, setPolitiquePosts] = useState([]);
  const [societePosts, setSocietePosts] = useState([]);
  const [economiePosts, setEconomiePosts] = useState([]);
  const [sportPosts, setSportPosts] = useState([]);
  const [afriquePosts, setAfriquePosts] = useState([]);
  const [culturePosts, setCulturePosts] = useState([]);
  const [internationalPosts, setInternationalPosts] = useState([]);
  const [opinionPosts, setOpinionPosts] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  TimeAgo.addDefaultLocale(en);

  useEffect(() => {
    const politiquePostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "politique"
      )
    );
    const firstFivePolitiquePosts = politiquePostsData.slice(0, 16);

    setPolitiquePosts(firstFivePolitiquePosts);
  }, [edges]);

  const politiqueOne = politiquePosts.slice(0, 1);
  const politiqueListOne = politiquePosts.slice(1, 4);
  const politiqueListTwo = politiquePosts.slice(6, 9);
  const politiqueMini = politiquePosts.slice(9, 15);

  useEffect(() => {
    setHeroPost(heroPost);
  }, [heroPost]);

  useEffect(() => {
    const societePostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "societe"
      )
    );
    const firstFiveSocietePosts = societePostsData.slice(0, 16);

    setSocietePosts(firstFiveSocietePosts);
  }, [edges]);

  const societeOne = societePosts.slice(0, 1);
  const societeListOne = societePosts.slice(1, 4);
  const societeListTwo = societePosts.slice(6, 9);
  const societeMini = societePosts.slice(9, 15);

  useEffect(() => {
    // Filter the posts where category slug = "politique"
    const economiePostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "economie"
      )
    );
    // Take the first 5 posts
    const firstFiveEconomiePosts = economiePostsData.slice(0, 16);

    setEconomiePosts(firstFiveEconomiePosts);
  }, [edges]);

  const economieOne = economiePosts.slice(0, 1);
  const economieListOne = economiePosts.slice(1, 4);
  const economieListTwo = economiePosts.slice(6, 9);
  const economieMini = economiePosts.slice(9, 15);

  useEffect(() => {
    // Filter the posts where category slug = "politique"
    const sportPostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "sport"
      )
    );
    // Take the first 5 posts
    const firstFiveSportPosts = sportPostsData.slice(0, 16);

    setSportPosts(firstFiveSportPosts);
  }, [edges]);

  const sportOne = sportPosts.slice(0, 1);
  const sportListOne = sportPosts.slice(1, 4);
  const sportListTwo = sportPosts.slice(6, 9);
  const sportMini = sportPosts.slice(9, 15);

  useEffect(() => {
    // Filter the posts where category slug = "afrique"
    const afriquePostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "afrique"
      )
    );
    // Take the first 5 posts
    const firstFiveAfriquePosts = afriquePostsData.slice(0, 10000);

    //console.log("5 first afrique", firstFiveAfriquePosts);

    setAfriquePosts(firstFiveAfriquePosts);
  }, [edges]);

  const afriqueOne = afriquePosts.slice(0, 1);
  const afriqueListOne = afriquePosts.slice(1, 4);
  const afriqueListTwo = afriquePosts.slice(6, 9);
  const afriqueMini = afriquePosts.slice(9, 15);

  useEffect(() => {
    // Filter the posts where category slug = "culture"
    const culturePostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "culture"
      )
    );
    // Take the first 5 posts
    const firstFiveCulturePosts = culturePostsData.slice(0, 30);

    setCulturePosts(firstFiveCulturePosts);
  }, [edges]);

  const cultureOne = culturePosts.slice(0, 1);
  const cultureListOne = culturePosts.slice(1, 4);
  const cultureListTwo = culturePosts.slice(6, 9);
  const cultureMini = culturePosts.slice(9, 15);

  useEffect(() => {
    // Filter the posts where category slug = "international"
    const internationalPostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "international"
      )
    );
    // Take the first 5 posts
    const firstFiveInternationalPosts = internationalPostsData.slice(0, 4);

    setInternationalPosts(firstFiveInternationalPosts);
  }, [edges]);

  const internationalOne = internationalPosts.slice(0, 4);

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const preventCopyPaste = (e: any) => {
      e.preventDefault();
    };
    document.documentElement.addEventListener("cut", preventCopyPaste);
    document.documentElement.addEventListener("copy", preventCopyPaste);
    document.documentElement.addEventListener("paste", preventCopyPaste);
    document.documentElement.addEventListener("contextmenu", preventCopyPaste);
    return () => {
      document.documentElement.removeEventListener("cut", preventCopyPaste);
      document.documentElement.removeEventListener("copy", preventCopyPaste);
      document.documentElement.removeEventListener("paste", preventCopyPaste);
      document.documentElement.addEventListener(
        "contextmenu",
        preventCopyPaste
      );
    };
  }, []);

  useEffect(() => {
    // Filter the posts where category slug = "opinion"
    const opinionPostsData = edges.filter((edge) =>
      edge.node.categories.edges.some(
        (category) => category.node.slug === "opinion"
      )
    );
    // Take the first 5 posts
    const firstFiveOpinionPosts = opinionPostsData.slice(0, 10);

    setInternationalPosts(firstFiveOpinionPosts);
  }, [edges]);

  const opinionOne = opinionPosts.slice(0, 50);

  const user = useUser();

  const postTitle = "Toutes les actualités | Afrikipresse";
  const postExcerptDecoded =
    "Afrikipresse couvre toutes les actualités d'Afrique, avec des reportages et des décryptages sur les événements du continent.";
  const postImage = "https://www.afrikipresse.com/default.png";
  const postAuthor = "Afrikipresse";
  const postTag = "Afrikipresse";
  const ogUrl = "https://www.afrikipresse.com";
  const publishedTime = "";
  const articleAuthor = "";
  const articleSection = "";

  return (
    <div>
      <Meta
        postTitle={postTitle}
        ogImage={postImage}
        postExcerptDecoded={postExcerptDecoded}
        postTags={postTag}
        ogUrl={ogUrl}
        publishedTime={publishedTime}
        articleAuthor={articleAuthor}
        articleSection={articleSection}
      />
      <Layout preview={preview} user={user}>
        {alertNews.length > 0 && <AlertLast posts={alertNews} />}

        <Container>
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={
                heroPost.featuredImage || {
                  node: {
                    sourceUrl: "https://www.afrikipresse.fr/default.png",
                    mediaDetails: {
                      width: 1500,
                      height: 800,
                    },
                  },
                }
              }
              author={heroPost.author}
              date={heroPost.date}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}

          <div className="grid grid-cols-1 lg:flex py-8">
            <div className="lg:mx-4">
              {newsTwo && (
                <HomeNews2
                  title={newsTwo.title}
                  coverImage={newsTwo.featuredImage}
                  excerpt={newsTwo.excerpt}
                  slug={newsTwo.slug}
                />
              )}
            </div>
            <div className="py-2 ">
              {newsTwo && (
                <HomeNews2
                  title={newsThree.title}
                  coverImage={newsThree.featuredImage}
                  excerpt={newsThree.excerpt}
                  slug={newsThree.slug}
                />
              )}
              <div className="flex justify-center lg:pt-4">
                <ParisSportif />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:flex py-8">
            {newsFive.length && <HomeFive posts={newsFive} />}
          </div>

          <div className=" border-b-[1px]">
            <LintelligentTv />
          </div>

          {/* TODO Selection de la rédaction */}

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 lg:pl-4">
              Politique
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div className="">
                {politiqueOne.length > 0 && (
                  <HomePolitique posts={politiqueOne} />
                )}
              </div>
              <div className="grid grid-cols-1 lg:flex lg:space-x-3">
                <div className="lg:w-1/2">
                  {politiqueListOne.length > 0 && (
                    <PreviewCategorieHomeList posts={politiqueListOne} />
                  )}
                </div>
                <div className="lg:w-1/2">
                  {politiqueListTwo.length > 0 && (
                    <PreviewCategorieHomeList posts={politiqueListTwo} />
                  )}
                </div>
              </div>
            </div>
            <div className="hidden lg:flex">
              <PreviewMini posts={politiqueMini} />
            </div>
          </div>

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 pl-4">
              Société
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {societeOne.length > 0 && <HomePolitique posts={societeOne} />}
              </div>
              <div className="grid grid-cols-1 lg:flex lg:space-x-3">
                <div className="lg:w-1/2">
                  {societeListOne.length > 0 && (
                    <PreviewCategorieHomeList posts={societeListOne} />
                  )}
                </div>
                <div className="lg:w-1/2">
                  {societeListTwo.length > 0 && (
                    <PreviewCategorieHomeList posts={societeListTwo} />
                  )}
                  <PronosticFoot />
                </div>
              </div>
            </div>
            <div className="hidden lg:flex">
              <PreviewMini posts={societeMini} />
            </div>
          </div>

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-6 pl-4">
              Économie
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {economieOne.length > 0 && (
                  <HomePolitique posts={economieOne} />
                )}
              </div>
              <div className="grid grid-cols-1 lg:flex lg:space-x-3">
                <div className="lg:w-1/2">
                  {economieListOne.length > 0 && (
                    <PreviewCategorieHomeList posts={economieListOne} />
                  )}
                </div>
                <div className="lg:w-1/2">
                  {economieListTwo.length > 0 && (
                    <PreviewCategorieHomeList posts={economieListTwo} />
                  )}
                </div>
              </div>
            </div>
            <div className="hidden lg:flex">
              <PreviewMini posts={economieMini} />
            </div>
          </div>

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 pl-4">Sport</div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {sportOne.length > 0 && <HomePolitique posts={sportOne} />}
              </div>
              <div className="grid grid-cols-1 lg:flex lg:space-x-3">
                <div className="lg:w-1/2">
                  {sportListOne.length > 0 && (
                    <PreviewCategorieHomeList posts={sportListOne} />
                  )}
                </div>
                <div className="lg:w-1/2">
                  {sportListTwo.length > 0 && (
                    <PreviewCategorieHomeList posts={sportListTwo} />
                  )}
                </div>
              </div>
            </div>
            <div className="hidden lg:flex">
              <PreviewMini posts={sportMini} />
            </div>
          </div>

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 pl-3">
              Afrique
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {afriqueOne.length > 0 && <HomePolitique posts={afriqueOne} />}
              </div>
              <div className="grid grid-cols-1 lg:flex lg:space-x-3">
                <div className="lg:w-1/2">
                  {afriqueListOne.length > 0 && (
                    <PreviewCategorieHomeList posts={afriqueListOne} />
                  )}
                </div>
                <div className="lg:w-1/2">
                  {afriqueListTwo.length > 0 && (
                    <PreviewCategorieHomeList posts={afriqueListTwo} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 pl-3">
              Culture
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {cultureOne.length > 0 && <HomePolitique posts={cultureOne} />}
              </div>
              <div className="grid grid-cols-1 lg:flex lg:space-x-3">
                <div className="lg:w-1/2">
                  {cultureListOne.length > 0 && (
                    <PreviewCategorieHomeList posts={cultureListOne} />
                  )}
                </div>
                <div className="lg:w-1/2">
                  {cultureListTwo.length > 0 && (
                    <PreviewCategorieHomeList posts={cultureListTwo} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-cyan-950">
            <div className="text-2xl font-extrabold pt-6 pb-3 pl-3">
              Opinion
            </div>
            <div className="grid grid-cols-1 lg:flex">
              <div>
                {internationalOne.length > 0 && (
                  <HomeInterPreview posts={internationalOne} />
                )}
              </div>
            </div>
          </div>
        </Container>
      </Layout>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  params,
}) => {
  const allPosts = await getAllPostsForHome(preview);
  const politiqueLastPosts = await getPolitiquePosts();
  const economieLastPosts = await getEconomiePosts();

  return {
    revalidate: 3600,
    props: { allPosts, preview, politiqueLastPosts, economieLastPosts },
  };
};
