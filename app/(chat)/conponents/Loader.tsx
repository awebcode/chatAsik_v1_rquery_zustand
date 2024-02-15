import React from "react";
import { ClimbingBoxLoader, ClipLoader, MoonLoader } from "react-spinners";
const Loader = () => {
  return (
    <div className="m-6">
      <div
        className="m-4 h-12 w-12 block mx-auto animate-spin rounded-full border-4 border-blue-500 border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="spinbutton"
      ></div>
    </div>
  );
};

export default Loader;
