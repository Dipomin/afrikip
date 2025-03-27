"use client";

import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: "#960202",
          color: "#fff",
        },
      }}
    />
  );
};

export default ToasterProvider;
