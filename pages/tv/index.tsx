import React from "react";
import Layout from "../../components/layout";
import LintelligentTv from "../../components/lintelligent-tv";

const LIntelligentTV = ({ preview, user }) => {
  return (
    <div>
      <Layout preview={preview} user={user}>
        <LintelligentTv />
      </Layout>
    </div>
  );
};

export default LIntelligentTV;
