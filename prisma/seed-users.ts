import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Création des utilisateurs de test...");

  // Créer un admin
  const admin = await prisma.user.upsert({
    where: { id: "user_admin_test_123" },
    update: {},
    create: {
      id: "user_admin_test_123",
      email: "admin@payflux.com",
      name: "Admin PayFlux",
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin créé: ${admin.name} (${admin.email})`);

  // Créer des clients
  const clients = [
    {
      id: "user_client_test_1",
      email: "client1@example.com",
      name: "Jean Dupont",
      role: "CLIENT" as const,
    },
    {
      id: "user_client_test_2",
      email: "client2@example.com",
      name: "Marie Martin",
      role: "CLIENT" as const,
    },
    {
      id: "user_client_test_3",
      email: "client3@example.com",
      name: "Pierre Durand",
      role: "CLIENT" as const,
    },
  ];

  for (const clientData of clients) {
    const client = await prisma.user.upsert({
      where: { id: clientData.id },
      update: {},
      create: clientData,
    });

    console.log(`✅ Client créé: ${client.name} (${client.email})`);
  }

  console.log(`\n🎉 ${1 + clients.length} utilisateurs créés avec succès!`);
  console.log("\n📝 Vous pouvez maintenant lancer le seed des factures avec:");
  console.log("   npm run seed");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de la création des utilisateurs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
