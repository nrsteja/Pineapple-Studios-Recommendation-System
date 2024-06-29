import React, {FC, ReactNode} from "react";

interface ChatProps {
  children: ReactNode;
}

const Chat: FC<ChatProps> = ({children}) => {
  return (
    <div className="chat chat-start px-4">
      <div className="avatar chat-image">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
          />
        </div>
      </div>
      <div className="chat-bubble">{children}</div>
    </div>
  );
};

export default Chat;
