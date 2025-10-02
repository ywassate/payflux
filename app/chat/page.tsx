import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "../lib/prisma";
import ChatInterface from "../components/ChatInterface";
import {
  getAllConversations,
  getClientConversations,
} from "../lib/chatActions";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { clientId?: string; invoiceId?: string };
}) {
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

  return (
    <ChatInterface
      conversations={conversations}
      clients={clients}
      currentUserId={user.id}
      currentUserName={user.name}
      isAdmin={isAdmin}
      initialClientId={searchParams.clientId}
      initialInvoiceId={searchParams.invoiceId}
    />
  );
}
