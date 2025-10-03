"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  Search,
  Users,
  FileText,
  X,
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
  initialSubject?: string;
  userAvatars?: Record<string, string>;
}

export default function ChatInterface({
  conversations: initialConversations,
  clients = [],
  currentUserId,
  currentUserName,
  isAdmin,
  initialInvoiceId,
  initialClientId,
  initialSubject,
  userAvatars = {},
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
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [conversationSubject, setConversationSubject] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialiser conversation si clientId ou invoiceId fourni
  useEffect(() => {
    if (!initializedRef.current) {
      if (initialClientId && isAdmin) {
        // Cas admin : sélectionner un client
        initializedRef.current = true;
        handleSelectClient(initialClientId, initialInvoiceId, initialSubject);
      } else if (!isAdmin && initialInvoiceId && initialSubject) {
        // Cas client : chercher conversation existante ou préparer nouvelle conversation
        initializedRef.current = true;
        const existingConv = initialInvoiceId
          ? conversations.find((c) => c.invoiceId === initialInvoiceId)
          : null;

        if (existingConv) {
          loadConversation(existingConv.id);
        } else {
          // Préparer nouvelle conversation avec sujet pré-défini
          setSelectedClientId(currentUserId);
          setSelectedInvoiceId(initialInvoiceId);
          setSelectedConversation(null);
          setMessages([]);
          setConversationSubject(initialSubject);
        }
      }
    }
  }, [initialClientId, initialInvoiceId, initialSubject, isAdmin, conversations]);

  // Pusher pour temps réel
  useEffect(() => {
    if (!selectedConversation) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`conversation-${selectedConversation.id}`);

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => {
        // Éviter les doublons (le message peut déjà être ajouté localement)
        if (prev.find((m) => m.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });

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
    invoiceId?: string | null,
    subject?: string | null
  ) => {
    try {
      // Chercher une conversation existante SEULEMENT si invoiceId fourni
      // (une facture ne devrait avoir qu'une seule conversation)
      // Pour les conversations générales, on permet plusieurs conversations par client
      const existingConv = invoiceId
        ? conversations.find(
            (c) => c.client.id === clientId && c.invoiceId === invoiceId
          )
        : null;

      if (existingConv) {
        // Si conversation existe pour cette facture, la charger
        await loadConversation(existingConv.id);
      } else {
        // Sinon, préparer une nouvelle conversation (pas encore créée)
        setSelectedClientId(clientId);
        setSelectedInvoiceId(invoiceId || null);
        setSelectedConversation(null);
        setMessages([]);

        // Si un sujet est fourni (depuis l'URL), l'utiliser directement
        if (subject) {
          setConversationSubject(subject);
        } else if (!invoiceId) {
          // Sinon, toujours demander l'objet pour permettre plusieurs conversations
          // avec le même client sur des sujets différents
          setShowSubjectModal(true);
        } else {
          setConversationSubject(`Discussion à propos de la facture`);
        }
      }

      setView("conversations");
    } catch (error) {
      console.error("Error selecting client:", error);
      alert("Erreur lors de la sélection du client");
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      let conversationId = selectedConversation?.id;

      // Si pas de conversation, c'est le premier message -> créer la conversation
      if (!selectedConversation && selectedClientId) {
        const subject = conversationSubject || "Nouvelle conversation";
        const newConversation = await getOrCreateConversation(
          selectedClientId,
          subject,
          selectedInvoiceId || undefined
        );

        // Ajouter à la liste et sélectionner la conversation (éviter les doublons)
        setConversations((prev) => {
          // Vérifier si la conversation existe déjà
          if (prev.find((c) => c.id === newConversation.id)) {
            return prev;
          }
          return [newConversation, ...prev];
        });
        conversationId = newConversation.id;

        // Important: définir la conversation sélectionnée AVANT d'envoyer le message
        // pour que Pusher soit initialisé
        setSelectedConversation(newConversation);
        setMessages([]);
      }

      if (!conversationId) return;

      const receiverId =
        isAdmin && selectedConversation
          ? selectedConversation.client.id
          : isAdmin && selectedClientId
          ? selectedClientId
          : undefined;

      const sentMessage = await sendMessage(
        conversationId,
        currentUserId,
        newMessage.trim(),
        receiverId
      );

      // Ajouter le message localement (Pusher le fera aussi mais c'est pour l'UX)
      if (sentMessage) {
        setMessages((prev) => {
          // Vérifier si le message existe déjà
          if (prev.find((m) => m.id === sentMessage.id)) {
            return prev;
          }
          return [...prev, sentMessage];
        });

        // Mettre à jour la conversation dans la liste
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [sentMessage],
                  lastMessageAt: sentMessage.createdAt,
                }
              : c
          )
        );
      }

      setNewMessage("");
      setSelectedClientId(null);
      setSelectedInvoiceId(null);
      setConversationSubject("");
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
      setConversations((prev) => {
        // Vérifier si la conversation existe déjà
        if (prev.find((c) => c.id === conversation.id)) {
          return prev;
        }
        return [conversation, ...prev];
      });
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

  // Dédupliquer les conversations par ID avec useMemo
  const uniqueConversations = useMemo(() => {
    return Array.from(new Map(conversations.map((c) => [c.id, c])).values());
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return uniqueConversations.filter(
      (conv) =>
        conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueConversations, searchTerm]);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Dédupliquer les messages par ID avec useMemo
  const uniqueMessages = useMemo(() => {
    return Array.from(new Map(messages.map((m) => [m.id, m])).values());
  }, [messages]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar gauche */}
      <div className="w-80 bg-card border-r border-themed flex flex-col">
        {/* Header simple */}
        <div className="p-4 border-b border-themed">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-primary">Messages</h2>
            {!isAdmin && (
              <button
                onClick={handleNewConversation}
                className="p-2 rounded-lg hover:bg-base-200 text-primary transition-colors"
                title="Contacter l'administrateur"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Barre de recherche simple */}
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

        {/* Tabs pour admin - Simple */}
        {isAdmin && (
          <div className="flex border-b border-themed">
            <button
              onClick={() => setView("conversations")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                view === "conversations"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Conversations ({uniqueConversations.length})</span>
              </div>
            </button>
            <button
              onClick={() => setView("clients")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                view === "clients"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>Clients ({clients.length})</span>
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
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contacter l'administrateur
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const lastMessage = conv.messages[0];
                  const unreadCount = conv.messages.filter(
                    (m: any) => !m.isRead && m.receiverId === currentUserId
                  ).length;

                  // Déterminer qui afficher : si admin, afficher client. Si client, afficher "Support"
                  const displayName = isAdmin
                    ? conv.client.name
                    : "Support Admin";
                  const displayInitial = displayName.charAt(0).toUpperCase();
                  // Masquer l'avatar de l'admin pour les clients
                  const displayAvatar = isAdmin ? userAvatars[conv.client.id] : null;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={`w-full p-3 text-left transition-colors border-b border-themed ${
                        selectedConversation?.id === conv.id
                          ? "bg-base-200"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {displayAvatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={displayAvatar}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {displayInitial}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-primary text-sm truncate">
                              {displayName}
                            </span>
                            <span className="text-xs text-muted flex-shrink-0 ml-2">
                              {formatDate(conv.lastMessageAt)}
                            </span>
                          </div>

                          {/* Sujet de conversation */}
                          {conv.subject && (
                            <div className="mb-1">
                              <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                                {conv.subject}
                              </span>
                            </div>
                          )}

                          {lastMessage ? (
                            <p
                              className={`text-xs truncate ${
                                unreadCount > 0
                                  ? "text-primary font-medium"
                                  : "text-secondary"
                              }`}
                            >
                              <span className="font-medium mr-1">
                                {lastMessage.sender.id === currentUserId
                                  ? "Vous:"
                                  : `${
                                      !isAdmin && lastMessage.sender.role === "ADMIN"
                                        ? "Support Admin"
                                        : lastMessage.sender.name
                                    }:`}
                              </span>
                              {lastMessage.sender.id === currentUserId && (
                                <span className="mr-1">
                                  {lastMessage.isRead ? "✓✓" : "✓"}
                                </span>
                              )}
                              {lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-xs text-muted italic">
                              Aucun message
                            </p>
                          )}

                          {conv.invoiceId && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                              <FileText className="h-3 w-3" />
                              <span>Facture liée</span>
                            </div>
                          )}
                        </div>

                        {unreadCount > 0 && (
                          <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
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
                    className="w-full p-3 text-left hover:bg-base-200 transition-colors border-b border-themed"
                  >
                    <div className="flex items-center gap-3">
                      {userAvatars[client.id] ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={userAvatars[client.id]}
                            alt={client.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted truncate">
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
        {selectedConversation || selectedClientId ? (
          <>
            {/* Header conversation */}
            <div className="p-4 bg-card border-b border-themed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    // Si admin, afficher le client. Si client, afficher "Support/Admin"
                    const clientId = selectedConversation?.client.id || selectedClientId;
                    const clientName =
                      selectedConversation?.client.name ||
                      (selectedClientId &&
                        clients.find((c) => c.id === selectedClientId)?.name) ||
                      "Client";
                    const displayName = isAdmin
                      ? clientName
                      : "Support Admin";
                    const displayInitial = displayName.charAt(0).toUpperCase();
                    // Masquer l'avatar de l'admin pour les clients
                    const avatarUrl = isAdmin && clientId ? userAvatars[clientId] : null;

                    return (
                      <>
                        {avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={avatarUrl}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {displayInitial}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-primary">
                            {displayName}
                          </h3>
                          {!selectedConversation && conversationSubject ? (
                            <span className="text-xs text-muted">
                              {conversationSubject}
                            </span>
                          ) : selectedConversation?.subject ? (
                            <span className="text-xs text-muted">
                              {selectedConversation.subject}
                            </span>
                          ) : (
                            <p className="text-xs text-muted">En ligne</p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  {(selectedConversation?.invoiceId || selectedInvoiceId) && (
                    <Link
                      href={`/invoices/${
                        selectedConversation?.invoiceId || selectedInvoiceId
                      }`}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Voir facture
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 rounded-lg hover:bg-base-200 transition-colors lg:hidden text-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-base-100">
              {uniqueMessages.map((message) => {
                const isOwn = message.sender.id === currentUserId;

                // Masquer l'identité de l'admin pour les clients
                const isAdminMessage = message.sender.role === "ADMIN";
                const displaySenderName = !isAdmin && isAdminMessage
                  ? "Support Admin"
                  : message.sender.name;
                const shouldShowAvatar = isAdmin || !isAdminMessage;
                const senderAvatar = shouldShowAvatar ? userAvatars[message.sender.id] : null;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar à gauche pour les messages reçus */}
                    {!isOwn && (
                      <div className="flex-shrink-0">
                        {senderAvatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={senderAvatar}
                              alt={displaySenderName}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                            {displaySenderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[65%] ${
                        isOwn
                          ? "bg-blue-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                          : "bg-card border border-themed text-primary rounded-tl-xl rounded-tr-xl rounded-br-xl"
                      } px-4 py-2 shadow-sm`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 text-muted">
                          {displaySenderName}
                        </p>
                      )}

                      <p className="text-sm break-words">{message.content}</p>

                      <div
                        className={`flex items-center gap-1 mt-1 text-xs justify-end ${
                          isOwn ? "text-white/70" : "text-muted"
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

                    {/* Avatar à droite pour les messages envoyés */}
                    {isOwn && (
                      <div className="flex-shrink-0">
                        {senderAvatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={senderAvatar}
                              alt={displaySenderName}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                            {displaySenderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
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
              {/* Champ objet modifiable pour nouvelle conversation */}
              {!selectedConversation && conversationSubject && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    Objet de la conversation
                  </label>
                  <input
                    type="text"
                    value={conversationSubject}
                    onChange={(e) => setConversationSubject(e.target.value)}
                    placeholder="Ex: Question sur la facture..."
                    className="w-full px-3 py-2 bg-base-100 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-primary"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2.5 bg-base-100 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-primary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Modal pour l'objet de la conversation */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border border-themed shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Objet de la conversation
            </h3>
            <input
              type="text"
              value={conversationSubject}
              onChange={(e) => setConversationSubject(e.target.value)}
              placeholder="Ex: Question sur le paiement, Demande de modification..."
              className="w-full px-4 py-3 bg-base-100 border border-themed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-primary mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && conversationSubject.trim()) {
                  setShowSubjectModal(false);
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setSelectedClientId(null);
                  setSelectedInvoiceId(null);
                  setConversationSubject("");
                }}
                className="px-4 py-2 rounded-lg border border-themed hover:bg-base-200 transition-colors text-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowSubjectModal(false)}
                disabled={!conversationSubject.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
