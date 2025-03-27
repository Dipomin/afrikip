"use client";

import { BounceLoader } from "react-spinners";
import Box from "../components/box";

const Loading = () => {
  return (
    <Box className="h-full flex items-center justify-center">
      <BounceLoader color="#ef0000" size={40} />
    </Box>
  );
};

export default Loading;
