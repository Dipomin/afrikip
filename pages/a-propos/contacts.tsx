import { LocateIcon, Mail, MapPinIcon, PhoneIcon } from "lucide-react";
import React from "react";
import LayoutAbonne from "../../components/layout-abonne";
import Layout from "../../components/layout";
import { useUser } from "@supabase/auth-helpers-react";
import Container from "../../components/container";

const ContactsAfrikipresse = ({ preview }) => {
  const user = useUser();

  return (
    <Layout preview={preview} user={user}>
      <Container>
        <div>
          <div className=" text-2xl lg:text-4xl font-black text-center p-10 text-black">
            Contacts Afrikipresse
          </div>
          <div className="flex p-3">
            <div className="mx-4">
              <PhoneIcon />
            </div>
            <div>+33 (0)6 01 26 46 78</div>
          </div>
          <div className="flex mx-4 p-3">
            <div className="mx-4">
              <MapPinIcon />
            </div>
            <div>2 rue du Président Willson, 9200 Levallois Perret</div>
          </div>
          <div className="flex mx-4 p-3">
            <div className="mx-4">
              <Mail />
            </div>
            <div>contact@afrikipresse.fr</div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default ContactsAfrikipresse;
