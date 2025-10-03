import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "../lib/prisma";
import ChatInterface from "../components/ChatInterface";
import Wrapper from "../components/Wrapper";
import {
  getAllConversations,
  getClientConversations,
} from "../lib/chatActions";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; invoiceId?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const sessionUser = await currentUser();

  if (!sessionUser) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user) {
    return <div>Utilisateur non trouvé</div>;
  }

  const isAdmin = user.role === "ADMIN";
  const conversations = isAdmin
    ? await getAllConversations()
    : await getClientConversations(user.id);

  // Charger la liste des clients pour l'admin
  const clients = isAdmin
    ? await prisma.user.findMany({
        where: { role: "CLIENT" },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  // Récupérer les avatars depuis Clerk pour tous les utilisateurs impliqués
  const userIds = new Set<string>();
  userIds.add(user.id);

  conversations.forEach((conv: any) => {
    userIds.add(conv.client.id);
    conv.messages?.forEach((msg: any) => {
      userIds.add(msg.sender.id);
    });
  });

  clients.forEach((client: any) => {
    userIds.add(client.id);
  });

  // Récupérer les infos Clerk pour tous les utilisateurs
  const userAvatars: Record<string, string> = {};
  const clerk = await clerkClient();

  for (const userId of Array.from(userIds)) {
    try {
      const clerkUser = await clerk.users.getUser(userId);
      if (clerkUser.imageUrl) {
        userAvatars[userId] = clerkUser.imageUrl;
      }
    } catch (error) {
      console.error(`Failed to fetch avatar for user ${userId}:`, error);
    }
  }

  return (
    <Wrapper noScroll>
      <ChatInterface
        conversations={conversations}
        clients={clients}
        currentUserId={user.id}
        currentUserName={user.name}
        isAdmin={isAdmin}
        initialClientId={params.clientId}
        initialInvoiceId={params.invoiceId}
        initialSubject={params.subject}
        userAvatars={userAvatars}
      />
    </Wrapper>
  );
}
