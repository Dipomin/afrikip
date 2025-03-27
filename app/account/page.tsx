import ManageSubscriptionButton from "./ManageSubscriptionButton";
import {
  getSession,
  getUserDetails,
  getSubscription,
} from "../supabase-server";
import Button from "../abonnement/components/ui/Button";
import { Database } from "../../types_db";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Image from "next/image";
import { Archive, Newspaper } from "lucide-react";

export default async function Account() {
  const [session, userDetails, subscription] = await Promise.all([
    getSession(),
    getUserDetails(),
    getSubscription(),
  ]);
  const supabase = createServerActionClient<Database>({ cookies });

  const user = session?.user;
  const userId = user?.id;

  //console.log(user);

  if (!session) {
    return redirect("/signin");
  }

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0,
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  const updateName = async (formData: FormData) => {
    "use server";

    const newName = formData.get("name") as string;

    const session = await getSession();
    const user = session?.user;
    const { error } = await supabase
      .from("users")
      .update({ full_name: newName })
      //@ts-ignore
      .eq("id", user?.id);
    if (error) {
      console.log(error);
    }
    revalidatePath("/account");
  };

  ("use server");
  let { data, error } = await supabase
    .from("mobilepayment")
    .select("*")
    .eq("user_foreign_key", session.user.id);

  if (error) {
    console.error(error.message);
    return;
  }
  const mobilePaymentMethod = data?.[0];

  const updateEmail = async (formData: FormData) => {
    "use server";

    const newEmail = formData.get("email") as string;
    const supabase = createServerActionClient<Database>({ cookies });
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.log(error);
    }
    revalidatePath("/account");
  };

  return (
    <section className="mb-24">
      <div className="flex justify-center space-x-3 pt-10">
        <Link
          href="/lintelligentpdf/aujourdhui"
          className="flex space-x-2 text-3xl font-extrabold text-white sm:text-center sm:text-2xl bg-slate-500 hover:bg-slate-700 cursor-pointer p-3 rounded-md"
        >
          <Newspaper /> <span>Lire le journal</span>
        </Link>
        <Link
          href="/lintelligentpdf/list"
          className="flex space-x-2 text-3xl font-extrabold text-white sm:text-center sm:text-2xl bg-slate-500 hover:bg-slate-700 cursor-pointer p-3 rounded-md"
        >
          <Newspaper /> <span>Archives des journaux</span>
        </Link>
        <Link
          href="/archives/2020"
          className="flex space-x-2 text-3xl font-extrabold text-white sm:text-center sm:text-2xl bg-slate-500 hover:bg-slate-700 cursor-pointer p-3 rounded-md"
        >
          <Archive /> <span>Archives des articles</span>
        </Link>
      </div>
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="text-center flex flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Mon compte
          </h1>
        </div>
      </div>
      <div className="p-4">
        <div>
          {mobilePaymentMethod ? (
            <Card
              title="Mobile money"
              description=""
              footer="Modifier mon abonnement"
            >
              <div>
                <div className="flex justify-center">
                  Votre abonnement actuel est :{" "}
                  <strong> {mobilePaymentMethod.description}</strong>
                </div>
                <div className="flex justify-center pt-6">
                  Renouveler mon abonnement ou changer de formule.
                </div>
                <div className="sm:flex justify-center mt-8 mb-4 text-xl gap-x-5 font-semibold">
                  <div className="flex justify-center mb-5">
                    <Button variant="slim" disabled={!session}>
                      <Link href="/mobile-payment/mensuel">
                        Mensuel <br /> 2000 F
                      </Link>
                    </Button>
                  </div>
                  <div className="flex justify-center mb-5">
                    <Button variant="slim" disabled={!session}>
                      <Link href="/mobile-payment/semestriel">
                        Semestriel <br /> 6500 F
                      </Link>
                    </Button>
                  </div>
                  <div className="flex justify-center mb-5">
                    <Button variant="slim" disabled={!session}>
                      <Link href="/mobile-payment/annuel">
                        Annuel <br /> 13000 F
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-x-20">
                <div className="flex gap-x-5 pb-5">
                  <div>
                    <Image
                      src="/orange-money.png"
                      width="50"
                      height="50"
                      alt="Orange Money"
                    />
                  </div>
                  <div>
                    <Image
                      src="/mtn-money.png"
                      width="50"
                      height="50"
                      alt="MTN Mobile Money"
                    />
                  </div>
                  <div>
                    <Image
                      src="/moov-money-2.png"
                      width="50"
                      height="50"
                      alt="Moov Money"
                    />
                  </div>
                  <div>
                    <Image src="/wave.png" width="50" height="50" alt="Wave" />
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card
              title="Abonnement par carte bancaire"
              description={
                subscription
                  ? `Votre formule actuelle est ${subscription?.prices?.products?.name}.`
                  : "Vous n'êtes abonné à aucune formule actuellement ."
              }
              footer={<ManageSubscriptionButton session={session} />}
            >
              <div className="mt-8 mb-4 text-xl font-semibold">
                {subscription ? (
                  `${subscriptionPrice}/${subscription?.prices?.interval}`
                ) : (
                  <Link href="/">Choisissez une formule</Link>
                )}
              </div>
            </Card>
          )}
        </div>
        <Card
          title="Votre nom"
          description="Veuillez saisir votre nom et prénom(s)."
          footer={
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">64 caractères maximum</p>
              <Button
                variant="slim"
                type="submit"
                form="nameForm"
                disabled={true}
              >
                {/* WARNING - In Next.js 13.4.x server actions are in alpha and should not be used in production code! */}
                Mettre à jour votre nom
              </Button>
            </div>
          }
        >
          <div className="mt-8 mb-4 text-xl font-semibold">
            <form id="nameForm" action={updateName}>
              <input
                type="text"
                name="name"
                className="w-1/2 p-3 rounded-md bg-zinc-200"
                defaultValue={userDetails?.full_name ?? ""}
                placeholder="Votre nom"
                maxLength={64}
              />
            </form>
          </div>
        </Card>
        <Card
          title="Votre adresse email"
          description="Veuillez saisir l'adresse email que vous souhaitez utiliser pour vous connecter."
          footer={
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
                Nous vous enverrons un email pour vérification.
              </p>
              <Button
                variant="slim"
                type="submit"
                form="emailForm"
                disabled={true}
              >
                {/* WARNING - In Next.js 13.4.x server actions are in alpha and should not be used in production code! */}
                Modifier mon adresse email
              </Button>
            </div>
          }
        >
          <div className="mt-8 mb-4 text-xl font-semibold">
            <form id="emailForm" action={updateEmail}>
              <input
                type="text"
                name="email"
                className="w-1/2 p-3 rounded-md bg-zinc-200"
                defaultValue={user ? user.email : ""}
                placeholder="Votre adresse email"
                maxLength={64}
              />
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
}

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, footer, children }: Props) {
  return (
    <div className="w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700">
      <div className="px-5 py-4">
        <h3 className="mb-1 text-center text-2xl font-medium">{title}</h3>
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      <div className="p-4 border-t text-center rounded-b-md border-zinc-700 bg-gray-500 text-black">
        {footer}
      </div>
    </div>
  );
}
