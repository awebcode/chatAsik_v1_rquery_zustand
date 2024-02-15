import ChatContextProvider from "@/context/ChatContext/ChatContextProvider";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
        <ChatContextProvider>{children}</ChatContextProvider>
     
  );
}
