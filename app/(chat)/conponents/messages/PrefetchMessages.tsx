// import React from "react";
// import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
// import { allMessages } from "@/functions/messageActions";
// import Messages from "./Messages";
// const PrefetchMessages = async (props:any) => {
//     console.log(props.chatId);
//   const queryClient = new QueryClient();
//   await queryClient.prefetchInfiniteQuery({
//     queryKey: ["messages", props.chatId], //als0 give here the chat id
//     queryFn: allMessages as any,
//     initialPageParam: 0,
//   });

//   return (
//     // Neat! Serialization is now as easy as passing props.
//     // HydrationBoundary is a Client Component, so hydration will happen there.
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Messages />
//     </HydrationBoundary>
//   );
// };

// export default PrefetchMessages;
