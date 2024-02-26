import React, { ReactNode } from 'react'
import dynamic from "next/dynamic";
const Topbar = dynamic(() => import("../(chat)/conponents/Topbar"));
const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      {" "}
      <Topbar />
      {children}
    </div>
  );
};

export default layout