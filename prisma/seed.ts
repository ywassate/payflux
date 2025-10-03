import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  // Récupérer les utilisateurs existants
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log("❌ Aucun utilisateur trouvé. Veuillez d'abord créer des utilisateurs.");
    return;
  }

  const admin = users.find(u => u.role === "ADMIN");
  const clients = users.filter(u => u.role === "CLIENT");

  if (!admin) {
    console.log("❌ Aucun administrateur trouvé.");
    return;
  }

  console.log(`✅ Admin trouvé: ${admin.name}`);
  console.log(`✅ ${clients.length} client(s) trouvé(s)`);

  // Créer des catégories si elles n'existent pas
  const categories = [
    { name: "Développement Web", description: "Services de développement web" },
    { name: "Consulting", description: "Services de consulting IT" },
    { name: "Design", description: "Services de design graphique" },
    { name: "Marketing", description: "Services marketing digital" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const allCategories = await prisma.category.findMany();
  console.log(`✅ ${allCategories.length} catégories créées`);

  // Créer des factures de test pour chaque client
  let invoiceCount = 0;

  for (const client of clients) {
    const statuses = ["PAID", "OVERDUE", "CANCELLED", "SENT", "DRAFT", "PARTIAL"];

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i] as any;
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];

      const invoiceNumber = `INV-2025-${String(invoiceCount + 1).padStart(4, "0")}`;

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          name: `Facture ${status} - ${client.name}`,
          issuerName: "PayFlux SAS",
          issuerAddress: "123 Rue de la Tech, 75001 Paris",
          clientName: client.name,
          clientAddress: "456 Avenue Client, 75002 Paris",
          clientEmail: client.email,
          clientPhone: "+33 1 23 45 67 89",
          invoiceDate: new Date(2025, 9, i + 1), // Octobre 2025
          dueDate: new Date(2025, 10, i + 1), // Novembre 2025
          vatActive: true,
          vatRate: 20,
          status: status,
          notes: `Facture de test avec statut ${status}`,
          categoryId: randomCategory.id,
          userId: client.id,
          totalHT: 1000 + (i * 500),
          totalTVA: (1000 + (i * 500)) * 0.2,
          totalTTC: (1000 + (i * 500)) * 1.2,
          lines: {
            create: [
              {
                description: "Développement application web",
                quantity: 10,
                unitPrice: 100 + (i * 50),
              },
            ],
          },
        },
      });

      invoiceCount++;
      console.log(`✅ Facture créée: ${invoice.invoiceNumber} (${status}) pour ${client.name}`);
    }
  }

  console.log(`\n🎉 Seeding terminé! ${invoiceCount} factures créées.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
