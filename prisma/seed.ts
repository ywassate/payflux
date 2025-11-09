import { PrismaClient, InvoiceLifecycle, InvoicePaymentStatus } from "@prisma/client";

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

  // Créer des factures de test pour chaque client avec différents états
  let invoiceCount = 0;

  // Définir les différents scénarios de factures
  const invoiceScenarios: Array<{
    lifecycle: InvoiceLifecycle;
    paymentStatus: InvoicePaymentStatus;
    sentAt: Date | null;
    name: string;
  }> = [
    {
      lifecycle: "DRAFT",
      paymentStatus: "PENDING",
      sentAt: null,
      name: "Brouillon en préparation"
    },
    {
      lifecycle: "APPROVED",
      paymentStatus: "PENDING",
      sentAt: null,
      name: "Facture approuvée prête à envoyer"
    },
    {
      lifecycle: "SENT",
      paymentStatus: "PENDING",
      sentAt: new Date(2025, 9, 15),
      name: "Facture envoyée en attente de paiement"
    },
    {
      lifecycle: "SENT",
      paymentStatus: "PARTIAL",
      sentAt: new Date(2025, 9, 10),
      name: "Facture partiellement payée"
    },
    {
      lifecycle: "SENT",
      paymentStatus: "OVERDUE",
      sentAt: new Date(2025, 8, 20),
      name: "Facture en retard de paiement"
    },
    {
      lifecycle: "SENT",
      paymentStatus: "PROCESSING",
      sentAt: new Date(2025, 9, 18),
      name: "Facture en cours de traitement"
    },
    {
      lifecycle: "CLOSED",
      paymentStatus: "PAID",
      sentAt: new Date(2025, 9, 5),
      name: "Facture payée et clôturée"
    },
    {
      lifecycle: "CLOSED",
      paymentStatus: "CANCELLED",
      sentAt: null,
      name: "Facture annulée"
    },
    {
      lifecycle: "SENT",
      paymentStatus: "REJECTED",
      sentAt: new Date(2025, 9, 12),
      name: "Facture contestée par le client"
    },
    {
      lifecycle: "CLOSED",
      paymentStatus: "REFUNDED",
      sentAt: new Date(2025, 9, 8),
      name: "Facture remboursée"
    },
  ];

  for (const client of clients) {
    for (let i = 0; i < invoiceScenarios.length; i++) {
      const scenario = invoiceScenarios[i];
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];

      const invoiceNumber = `INV-2025-${String(invoiceCount + 1).padStart(4, "0")}`;

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          name: `${scenario.name} - ${client.name}`,
          issuerName: "PayFlux SAS",
          issuerAddress: "123 Rue de la Tech, 75001 Paris",
          clientName: client.name,
          clientAddress: "456 Avenue Client, 75002 Paris",
          clientEmail: client.email,
          clientPhone: "+33 1 23 45 67 89",
          invoiceDate: new Date(2025, 9, i + 1),
          dueDate: new Date(2025, 10, i + 1),
          sentAt: scenario.sentAt,
          vatActive: true,
          vatRate: 20,
          lifecycle: scenario.lifecycle,
          paymentStatus: scenario.paymentStatus,
          notes: `Facture de test: ${scenario.name}`,
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
      console.log(
        `✅ Facture créée: ${invoice.invoiceNumber} (${scenario.lifecycle}/${scenario.paymentStatus}) pour ${client.name}`
      );
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
