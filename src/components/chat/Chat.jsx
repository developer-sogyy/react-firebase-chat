import { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

const Chat = () => {
  const [chat, setChat] = useState(false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  },[]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = e => {
    setText(prev => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if(text === "") return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages:arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatSnapshot = await getDoc(userChatsRef);
  
        if(userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();
  
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
  
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
  
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          })
        }
      });
    } catch(err) {
      console.log(err);
    }
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>User Description</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        { chat?.messages?.map(message => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              <p>{message.text}</p>
              {/*<span>{message}</span>*/}
            </div>
          </div>
        ))
        }

        
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          {/*<img src="./img.png" alt="" />*/}
          {/*<img src="./camera.png" alt="" />*/}
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" className="input" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? 'You cannot send a message' : 'Type a message...'} value={text} disabled={isCurrentUserBlocked || isReceiverBlocked} onChange={(e) => setText(e.target.value)} />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
          <div className="picker">
          <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat