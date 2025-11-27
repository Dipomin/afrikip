import { LocateIcon, Mail, MapPinIcon, PhoneIcon } from "lucide-react";
import React from "react";
import LayoutAbonne from "../../components/layout-abonne";
import Layout from "../../components/layout";

import Container from "../../components/container";

const FAQ = () => {
  return (
    <Layout>
      <Container>
        <div>
          <div className="text-2xl lg:text-4xl font-black text-center p-10 text-black">
            Foire aux questions (FAQ)
          </div>
          <div className="">
            <div>
              <div className="text-xl lg:text-2xl font-extrabold"></div>
              <div className="font-bold text-xl"></div>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default FAQ;
