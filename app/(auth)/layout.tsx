import React, { ReactNode } from 'react'
import Topbar from '../(chat)/conponents/Topbar';

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