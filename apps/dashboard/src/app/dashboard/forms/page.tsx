"use client";

import { useState } from "react";
import { Card, Button, Modal, ConfirmDialog, TextInput, Select } from "@meform/ui";
import { UI_LABELS } from "@meform/config";
import { useForms, useCreateForm, useUpdateForm, useDeleteForm } from "@/hooks/use-forms";
import { useUrlRules } from "@/hooks/use-url-rules";
import { useAppContext } from "@/contexts/AppContext";
import { CreateFormRequestSchema, UpdateFormRequestSchema } from "@meform/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { ROUTES } from "@meform/config";

type CreateFormForm = z.infer<typeof CreateFormRequestSchema>;
type UpdateFormForm = z.infer<typeof UpdateFormRequestSchema>;

export default function FormsPage() {
  const router = useRouter();
  const { selectedAppId } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<{ id: string; name: string; urlRuleId: string | null } | null>(null);
  const [deletingForm, setDeletingForm] = useState<{ id: string; name: string } | null>(null);

  const { data: forms = [], isLoading } = useForms(selectedAppId);
  const { data: urlRules = [] } = useUrlRules(selectedAppId);
  const createMutation = useCreateForm(selectedAppId);
  const updateMutation = useUpdateForm(selectedAppId);
  const deleteMutation = useDeleteForm(selectedAppId);

  const createForm = useForm<CreateFormForm>({
    resolver: zodResolver(CreateFormRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      urlRuleId: undefined,
    },
  });

  const updateForm = useForm<UpdateFormForm>({
    resolver: zodResolver(UpdateFormRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      urlRuleId: undefined,
    },
  });

  const handleCreateSubmit = async (data: CreateFormForm) => {
    try {
      await createMutation.mutateAsync(data);
      setIsAddModalOpen(false);
      createForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (form: { id: string; name: string; urlRuleId: string | null }) => {
    setEditingForm(form);
    updateForm.reset({
      name: form.name,
      urlRuleId: form.urlRuleId || undefined,
    });
  };

  const handleUpdateSubmit = async (data: UpdateFormForm) => {
    if (!editingForm) return;
    try {
      await updateMutation.mutateAsync({ formId: editingForm.id, data });
      setEditingForm(null);
      updateForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deletingForm) return;
    try {
      await deleteMutation.mutateAsync(deletingForm.id);
      setDeletingForm(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleView = (formId: string) => {
    router.push(`${ROUTES.DASHBOARD.FORMS}/${formId}`);
  };

  if (!selectedAppId) {
    return (
      <Card title={UI_LABELS.FORMS}>
        <div className="text-center py-8 text-gray-500">
          Please select an application first
        </div>
      </Card>
    );
  }

  const urlRuleOptions = [
    { value: "", label: "None (selectable via rules)" },
    ...urlRules.map((rule) => ({
      value: rule.id,
      label: `${rule.hostname} - ${rule.pathPattern}`,
    })),
  ];

  return (
    <>
      <Card
        title={UI_LABELS.FORMS}
        headerActions={
          <Button onClick={() => setIsAddModalOpen(true)}>{UI_LABELS.ADD_FORM}</Button>
        }
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : forms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No forms found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">{UI_LABELS.NAME}</th>
                  <th className="text-left p-2">Fields</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-b">
                    <td className="p-2">{form.id.slice(0, 8)}...</td>
                    <td className="p-2">{form.name}</td>
                    <td className="p-2">{form._count?.fields || 0}</td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mr-2"
                        onClick={() => handleView(form.id)}
                      >
                        {UI_LABELS.VIEW}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mr-2"
                        onClick={() => handleEdit(form)}
                      >
                        {UI_LABELS.EDIT}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeletingForm({ id: form.id, name: form.name })}
                      >
                        {UI_LABELS.DELETE}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={isAddModalOpen || editingForm !== null}
        title={editingForm ? UI_LABELS.EDIT_FORM : UI_LABELS.ADD_FORM}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingForm(null);
          createForm.reset();
          updateForm.reset();
        }}
        primaryAction={{
          label: UI_LABELS.SAVE,
          onClick: () => {
            if (editingForm) {
              updateForm.handleSubmit(handleUpdateSubmit)();
            } else {
              createForm.handleSubmit(handleCreateSubmit)();
            }
          },
          isLoading: editingForm ? updateMutation.isPending : createMutation.isPending,
        }}
        secondaryAction={{
          label: UI_LABELS.CANCEL,
          onClick: () => {
            setIsAddModalOpen(false);
            setEditingForm(null);
            createForm.reset();
            updateForm.reset();
          },
        }}
      >
        <form
          onSubmit={editingForm ? updateForm.handleSubmit(handleUpdateSubmit) : createForm.handleSubmit(handleCreateSubmit)}
          className="space-y-4"
        >
          {editingForm ? (
            <>
              <Controller
                name="name"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.NAME}
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="urlRuleId"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <Select
                    label={UI_LABELS.URL_RULE}
                    options={urlRuleOptions}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Controller
                name="name"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.NAME}
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="urlRuleId"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Select
                    label={UI_LABELS.URL_RULE}
                    options={urlRuleOptions}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deletingForm !== null}
        title={UI_LABELS.DELETE_FORM}
        message={`${UI_LABELS.CONFIRM_DELETE_FORM} (${deletingForm?.name})`}
        onClose={() => setDeletingForm(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
