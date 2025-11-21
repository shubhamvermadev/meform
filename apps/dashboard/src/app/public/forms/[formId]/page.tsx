import { redirect } from "next/navigation";
import { prisma } from "@meform/db";
import { ROUTES } from "@meform/config";
import { PublicFormPage } from "@/components/public/PublicFormPage";

interface PageProps {
  params: Promise<{ formId: string }>;
}

export default async function PublicFormPageRoute({ params }: PageProps) {
  const { formId } = await params;

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      application: true,
      fields: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });

  // Check if form exists, is shareable, app is active, and not deleted
  if (
    !form ||
    !form.sharePublicly ||
    form.application.status !== "ACTIVE" ||
    form.deletedAt ||
    form.application.deletedAt
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-backgroundSoft">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-2">Form Not Found</h1>
          <p className="text-gray">This form is not available or has been disabled.</p>
        </div>
      </div>
    );
  }

  return <PublicFormPage form={form} />;
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
