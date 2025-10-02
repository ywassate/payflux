"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  Search,
  Users,
  FileText,
  X,
  Phone,
  MoreVertical,
} from "lucide-react";
import {
  sendMessage,
  markMessagesAsRead,
  getConversationWithMessages,
  getOrCreateConversation,
} from "../lib/chatActions";
import { getPusherClient } from "../lib/pusher";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  subject: string | null;
  invoiceId: string | null;
  lastMessageAt: Date;
  client: {
    id: string;
    name: string;
    email: string;
  };
  messages: Message[];
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ChatInterfaceProps {
  conversations: any[];
  clients?: Client[];
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
  initialInvoiceId?: string;
  initialClientId?: string;
}

export default function ChatInterface({
  conversations: initialConversations,
  clients = [],
  currentUserId,
  currentUserName,
  isAdmin,
  initialInvoiceId,
  initialClientId,
}: ChatInterfaceProps) {
  const [view, setView] = useState<"conversations" | "clients">(
    isAdmin && initialClientId ? "clients" : "conversations"
  );
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialiser conversation si clientId ou invoiceId fourni
  useEffect(() => {
    if (initialClientId && isAdmin) {
      handleSelectClient(initialClientId, initialInvoiceId);
    }
  }, [initialClientId, initialInvoiceId, isAdmin]);

  // Pusher pour temps réel
  useEffect(() => {
    if (!selectedConversation) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`conversation-${selectedConversation.id}`);

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);

      // Marquer comme lu si pas l'expéditeur
      if (data.sender.id !== currentUserId) {
        markMessagesAsRead(selectedConversation.id, currentUserId);
      }
    });

    return () => {
      pusher.unsubscribe(`conversation-${selectedConversation.id}`);
    };
  }, [selectedConversation, currentUserId]);

  // Charger les messages d'une conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await getConversationWithMessages(conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        setMessages(conversation.messages);
        await markMessagesAsRead(conversationId, currentUserId);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  // Sélectionner un client (admin)
  const handleSelectClient = async (
    clientId: string,
    invoiceId?: string | null
  ) => {
    try {
      const subject = invoiceId
        ? `Discussion à propos de la facture`
        : "Nouvelle conversation";
      const conversation = await getOrCreateConversation(
        clientId,
        subject,
        invoiceId || undefined
      );

      // Ajouter à la liste si nouvelle
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversation.id);
        if (!exists) {
          return [conversation, ...prev];
        }
        return prev;
      });

      await loadConversation(conversation.id);
      setView("conversations");
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Erreur lors de la création de la conversation");
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const receiverId = isAdmin ? selectedConversation.client.id : undefined;

      await sendMessage(
        selectedConversation.id,
        currentUserId,
        newMessage.trim(),
        receiverId
      );

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle conversation (client)
  const handleNewConversation = async () => {
    try {
      const conversation = await getOrCreateConversation(
        currentUserId,
        "Nouvelle conversation"
      );
      setConversations((prev) => [conversation, ...prev]);
      loadConversation(conversation.id);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Erreur lors de la création de la conversation");
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-base-200 rounded-xl overflow-hidden border border-themed">
      {/* Sidebar gauche */}
      <div className="w-96 bg-card border-r border-themed flex flex-col">
        {/* Header */}
        <div className="p-4 bg-base-200 border-b border-themed">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-primary">Messages</h2>
            <button className="p-2 rounded-full hover:bg-base-200 transition-colors">
              <MoreVertical className="h-5 w-5 text-secondary" />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                view === "clients" ? "Rechercher un client..." : "Rechercher..."
              }
              className="w-full pl-10 pr-4 py-2 bg-base-100 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-primary"
            />
          </div>
        </div>

        {/* Tabs pour admin */}
        {isAdmin && (
          <div className="flex border-b border-themed bg-card">
            <button
              onClick={() => setView("conversations")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                view === "conversations"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversations ({conversations.length})
              </div>
            </button>
            <button
              onClick={() => setView("clients")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                view === "clients"
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Clients ({clients.length})
              </div>
            </button>
          </div>
        )}

        {/* Liste conversations ou clients */}
        <div className="flex-1 overflow-y-auto">
          {view === "conversations" ? (
            <>
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-12 w-12 text-muted mb-3" />
                  <p className="text-muted text-sm">
                    {searchTerm
                      ? "Aucune conversation trouvée"
                      : "Aucune conversation"}
                  </p>
                  {!isAdmin && !searchTerm && (
                    <button
                      onClick={handleNewConversation}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Nouvelle conversation
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const lastMessage = conv.messages[0];
                  const unreadCount = conv.messages.filter(
                    (m: any) => !m.isRead && m.receiverId === currentUserId
                  ).length;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={`w-full p-4 text-left hover:bg-base-200 transition-colors border-b border-themed ${
                        selectedConversation?.id === conv.id ? "bg-base-200" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                          {conv.client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-primary text-sm truncate">
                              {conv.client.name}
                            </span>
                            <span className="text-xs text-muted flex-shrink-0 ml-2">
                              {formatDate(conv.lastMessageAt)}
                            </span>
                          </div>
                          {lastMessage && (
                            <p
                              className={`text-sm truncate ${
                                unreadCount > 0
                                  ? "text-primary font-medium"
                                  : "text-secondary"
                              }`}
                            >
                              {lastMessage.sender.id === currentUserId && (
                                <span className="mr-1">
                                  {lastMessage.isRead ? "✓✓" : "✓"}
                                </span>
                              )}
                              {lastMessage.content}
                            </p>
                          )}
                          {conv.invoiceId && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                              <FileText className="h-3 w-3" />
                              <span>Facture liée</span>
                            </div>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </>
          ) : (
            <>
              {filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Users className="h-12 w-12 text-muted mb-3" />
                  <p className="text-muted text-sm">Aucun client trouvé</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className="w-full p-4 text-left hover:bg-base-200 transition-colors border-b border-themed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-secondary truncate">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col bg-base-100">
        {selectedConversation ? (
          <>
            {/* Header conversation */}
            <div className="p-4 bg-card border-b border-themed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {selectedConversation.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {selectedConversation.client.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {selectedConversation.client.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation.invoiceId && (
                    <Link
                      href={`/invoices/${selectedConversation.invoiceId}`}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Voir facture
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 rounded-full hover:bg-base-200 transition-colors lg:hidden"
                  >
                    <X className="h-5 w-5 text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
              }}
            >
              {messages.map((message) => {
                const isOwn = message.sender.id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] ${
                        isOwn
                          ? "bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-card text-primary rounded-tl-2xl rounded-tr-2xl rounded-br-2xl border border-themed"
                      } px-4 py-2 shadow-sm`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="text-sm break-words">{message.content}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs justify-end ${
                          isOwn ? "opacity-70" : "opacity-50"
                        }`}
                      >
                        <span>{formatTime(message.createdAt)}</span>
                        {isOwn && (
                          <>
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulaire d'envoi */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-card border-t border-themed"
            >
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-3 bg-base-100 border border-themed rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-primary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <MessageSquare className="h-20 w-20 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                {isAdmin
                  ? "Sélectionnez une conversation ou un client"
                  : "Sélectionnez une conversation"}
              </h3>
              <p className="text-muted">
                {isAdmin
                  ? "Choisissez une conversation existante ou un client pour commencer"
                  : "Choisissez une conversation pour commencer à discuter"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
