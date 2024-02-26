import { useVidoeCallStore } from "@/store/useCallStore";
import { useChatStore } from "@/store/useChat";
import { useEffect } from "react";

const RejectedCallModal = () => {
  const { selectedChat } = useChatStore();
  const { isRejected, rejectBy } = useVidoeCallStore();

  useEffect(() => {
    if (isRejected) {
      const timeoutId = setTimeout(() => {
        useVidoeCallStore.setState({ isRejected: false });
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isRejected]);

  return (
    <div
      className={`z-50 fixed max-w-md w-full p-20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-md shadow-lg transition-transform duration-500 ring-2 ring-rose-500 ${
        isRejected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      }`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-rose-500 mb-2">Call Ended!</h2>
        <p className="text-lg text-gray-200">{rejectBy?.username} rejected the call.</p>
      </div>
    </div>
  );
};

export default RejectedCallModal;
