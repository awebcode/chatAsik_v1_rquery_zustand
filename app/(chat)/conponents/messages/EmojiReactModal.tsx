import React from "react";
import { MdAdd, MdClose, MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker, {
  Theme,
  EmojiStyle,
  SuggestionMode,
  Categories,
} from "emoji-picker-react";

const EmojiReactModal = ({
  message,
  openReactModal,
  setOpenReactModal,
  onEmojiClick,
  emojiModalRef,
  openEmojiModal,
  setOpenEmojiModal,
  isCurrentUserMessage,
}: any) => {
  return (
    <div>
      <div
        className={`absolute -top-[90px] -right-20 p-4 rounded-xl bg-gray-800  max-w-[40rem] transition-all  duration-500  ${
          openReactModal ? "block opacity-100" : "hidden opacity-0"
        }`}
      >
        <div className="flexBetween flex-row w-full gap-x-2">
          {["🙂", "😍", "❤", "😠", "😜"].map((v, i: number) => {
            return (
              <>
                {" "}
                <span
                  onClick={() => {
                    const e = { emoji: v };
                    onEmojiClick(e, message._id);
                    // setOpenReactModal(false);
                    // setOpenEmojiModal(false);
                  }}
                  key={i}
                  className={`text-gray-300 h-6 w-6 mr-1 cursor-pointer transition-all duration-500 hover:scale-105`}
                >
                  {" "}
                  {v}
                </span>
              </>
            );
          })}
          <span ref={emojiModalRef} className="p-2 rounded-full bg-gray-700">
            <MdAdd
              onClick={() => setOpenEmojiModal((prev: boolean) => !prev)}
              className={`text-gray-300 h-[18px] w-[18px] mr-1 cursor-pointer `}
            />
            <EmojiPicker
              open={openEmojiModal}
              style={{
                position: "absolute",
                top: !isCurrentUserMessage ? "" : "0px", // Adjust this value based on your design
                right: !isCurrentUserMessage ? "-220px" : "0px",
                zIndex: 1000,
              }}
              height={360}
              width={310}
              onEmojiClick={(e) => {
                onEmojiClick(e, message._id);
                setOpenReactModal(false);
                setOpenEmojiModal(false);
              }}
              autoFocusSearch
              theme={Theme.DARK}
              lazyLoadEmojis
              emojiStyle={EmojiStyle.FACEBOOK}
              searchPlaceholder="Search chat emojis..."
              suggestedEmojisMode={SuggestionMode.RECENT}
              customEmojis={[
                {
                  names: ["Alice", "alice in wonderland"],
                  imgUrl:
                    "https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png",
                  id: "alice",
                },
              ]}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmojiReactModal;
