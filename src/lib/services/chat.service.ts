import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export const ChatService = {
  /**
   * Send a message to the group chat
   */
  async sendGroupMessage(hostelId: string, senderId: string, senderName: string, text: string): Promise<void> {
    const colRef = collection(db, "hostels", hostelId, "groupChat");
    await addDoc(colRef, {
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Listen to group messages in real-time
   */
  subscribeGroupMessages(hostelId: string, callback: (messages: ChatMessage[]) => void) {
    const colRef = collection(db, "hostels", hostelId, "groupChat");
    const q = query(colRef, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages);
    });
  },

  /**
   * Get DM channel ID deterministically
   */
  getDmChannelId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  },

  /**
   * Send a 1-to-1 direct message
   */
  async sendDirectMessage(hostelId: string, senderId: string, receiverId: string, senderName: string, text: string): Promise<void> {
    const channelId = this.getDmChannelId(senderId, receiverId);
    const colRef = collection(db, "hostels", hostelId, "directMessages", channelId, "messages");
    await addDoc(colRef, {
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Listen to direct messages in real-time
   */
  subscribeDirectMessages(hostelId: string, senderId: string, receiverId: string, callback: (messages: ChatMessage[]) => void) {
    const channelId = this.getDmChannelId(senderId, receiverId);
    const colRef = collection(db, "hostels", hostelId, "directMessages", channelId, "messages");
    const q = query(colRef, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages);
    });
  },
};
