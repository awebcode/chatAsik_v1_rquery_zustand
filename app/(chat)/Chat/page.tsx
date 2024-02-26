import React from "react";

import dynamic from "next/dynamic";
import ClientWrap from "../conponents/ClientWrap";
// import PrefetchMessages from "../conponents/messages/PrefetchMessages";
const Chat = dynamic(() => import("./Index"));
const page = () => {
  return (
    <div>
      <Chat />

      {/* <PrefetchMessages chatId={props.searchParams.chatId} /> */}
    </div>
  );
};

export default page;
