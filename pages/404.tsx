import Link from "next/link";
import Button from "../components/button";
import Layout from "../components/layout";

export default function Custom404({ preview, user }) {
  return (
    <div>
      <Layout preview={preview} user={user}>
        <h1 className="text-3xl text-red-600">
          404 - La Page que vous recherchez est introuvable
        </h1>
        <Link href="/">
          <Button>Retourner</Button>
        </Link>
      </Layout>
    </div>
  );
}
