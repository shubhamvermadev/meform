import { prisma } from "./index";
import bcrypt from "bcrypt";

/**
 * Seed script to create demo user and sample application
 */
async function main() {
  console.log("Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@meform.com" },
    update: {},
    create: {
      email: "demo@meform.com",
      passwordHash,
      emailVerified: true,
    },
  });

  console.log("Created user:", user.email);

  // Create sample application
  const application = await prisma.application.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Demo App",
      },
    },
    update: {},
    create: {
      ownerId: user.id,
      name: "Demo App",
      description: "Sample application for testing",
      colorTheme: "accent",
    },
  });

  console.log("Created application:", application.name);

  // Create URL rule
  const urlRule = await prisma.urlRule.create({
    data: {
      applicationId: application.id,
      hostname: "example.com",
      pathPattern: "/*",
    },
  });

  console.log("Created URL rule:", urlRule.hostname, urlRule.pathPattern);

  // Create form
  const form = await prisma.form.create({
    data: {
      applicationId: application.id,
      name: "Contact Form",
      urlRuleId: urlRule.id,
      version: 1,
    },
  });

  console.log("Created form:", form.name);

  // Create form fields
  const field1 = await prisma.formField.create({
    data: {
      formId: form.id,
      name: "Name",
      key: "name",
      type: "TEXT",
      required: true,
      placeholder: "Enter your name",
      position: 0,
    },
  });

  const field2 = await prisma.formField.create({
    data: {
      formId: form.id,
      name: "Email",
      key: "email",
      type: "EMAIL",
      required: true,
      placeholder: "Enter your email",
      position: 1,
    },
  });

  console.log("Created form fields:", field1.name, field2.name);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

