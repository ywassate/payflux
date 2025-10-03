"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { triggerPusherEvent } from "./pusher";

// Créer ou récupérer une conversation
export async function getOrCreateConversation(
  clientId: string,
  subject?: string,
  invoiceId?: string
) {
  try {
    // Logique de recherche :
    // - Si invoiceId fourni : chercher par clientId + invoiceId (une facture = une conversation unique)
    // - Sinon : chercher par clientId + subject (permet plusieurs conversations avec sujets différents)

    const searchCriteria: any = {
      clientId,
    };

    // Si c'est une conversation liée à une facture
    if (invoiceId) {
      searchCriteria.invoiceId = invoiceId;
    } else if (subject) {
      // Si c'est une conversation générale, chercher aussi par sujet
      searchCriteria.subject = subject;
    }

    let conversation = await prisma.conversation.findFirst({
      where: searchCriteria,
      include: {
        client: true,
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Si pas de conversation avec ce sujet/facture, en créer une nouvelle
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          subject: subject || "Nouvelle conversation",
          invoiceId,
        },
        include: {
          client: true,
          messages: {
            include: {
              sender: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    }

    return conversation;
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    throw new Error("Impossible de créer/récupérer la conversation");
  }
}

// Récupérer toutes les conversations (pour l'admin)
export async function getAllConversations() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        client: true,
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Dernier message seulement
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return conversations;
  } catch (error) {
    console.error("Error in getAllConversations:", error);
    throw new Error("Impossible de récupérer les conversations");
  }
}

// Récupérer les conversations d'un client
export async function getClientConversations(clientId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        clientId,
      },
      include: {
        client: true,
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return conversations;
  } catch (error) {
    console.error("Error in getClientConversations:", error);
    throw new Error("Impossible de récupérer vos conversations");
  }
}

// Envoyer un message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  receiverId?: string
) {
  try {
    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Trigger événement Pusher pour temps réel
    await triggerPusherEvent(
      `conversation-${conversationId}`,
      "new-message",
      message
    );

    // Notifier le destinataire si présent
    if (receiverId) {
      await triggerPusherEvent(
        `user-${receiverId}`,
        "new-message-notification",
        {
          conversationId,
          senderId,
          senderName: message.sender.name,
          preview: content.substring(0, 50),
        }
      );
    }

    revalidatePath("/chat");
    return message;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

// Marquer les messages comme lus
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
) {
  try {
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/chat");
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    throw new Error("Impossible de marquer les messages comme lus");
  }
}

// Compter les messages non lus
export async function getUnreadMessagesCount(userId: string) {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error in getUnreadMessagesCount:", error);
    return 0;
  }
}

// Récupérer une conversation avec tous ses messages
export async function getConversationWithMessages(conversationId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: true,
        messages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return conversation;
  } catch (error) {
    console.error("Error in getConversationWithMessages:", error);
    throw new Error("Impossible de récupérer la conversation");
  }
}
