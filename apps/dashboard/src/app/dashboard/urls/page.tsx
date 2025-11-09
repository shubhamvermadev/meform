"use client";

import { useState } from "react";
import { Card, Button, Modal, ConfirmDialog, TextInput } from "@meform/ui";
import { UI_LABELS, UI_DESCRIPTIONS } from "@meform/config";
import { useUrlRules, useCreateUrlRule, useUpdateUrlRule, useDeleteUrlRule } from "@/hooks/use-url-rules";
import { useAppContext } from "@/contexts/AppContext";
import { CreateUrlRuleRequestSchema, UpdateUrlRuleRequestSchema } from "@meform/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

type CreateUrlRuleForm = z.infer<typeof CreateUrlRuleRequestSchema>;
type UpdateUrlRuleForm = z.infer<typeof UpdateUrlRuleRequestSchema>;

export default function UrlsPage() {
  const { selectedAppId } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<{ id: string; hostname: string; pathPattern: string } | null>(null);
  const [deletingRule, setDeletingRule] = useState<{ id: string; hostname: string } | null>(null);

  const { data: urlRules = [], isLoading } = useUrlRules(selectedAppId);
  const createMutation = useCreateUrlRule(selectedAppId);
  const updateMutation = useUpdateUrlRule(selectedAppId);
  const deleteMutation = useDeleteUrlRule(selectedAppId);

  const createForm = useForm<CreateUrlRuleForm>({
    resolver: zodResolver(CreateUrlRuleRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      hostname: "",
      pathPattern: "",
    },
  });

  const updateForm = useForm<UpdateUrlRuleForm>({
    resolver: zodResolver(UpdateUrlRuleRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      hostname: "",
      pathPattern: "",
    },
  });

  const handleCreateSubmit = async (data: CreateUrlRuleForm) => {
    try {
      await createMutation.mutateAsync(data);
      setIsAddModalOpen(false);
      createForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (rule: { id: string; hostname: string; pathPattern: string }) => {
    setEditingRule(rule);
    updateForm.reset({
      hostname: rule.hostname,
      pathPattern: rule.pathPattern,
    });
  };

  const handleUpdateSubmit = async (data: UpdateUrlRuleForm) => {
    if (!editingRule) return;
    try {
      await updateMutation.mutateAsync({ ruleId: editingRule.id, data });
      setEditingRule(null);
      updateForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deletingRule) return;
    try {
      await deleteMutation.mutateAsync(deletingRule.id);
      setDeletingRule(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!selectedAppId) {
    return (
      <Card title={UI_LABELS.URL}>
        <div className="text-center py-8 text-gray-500">
          Please select an application first
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={UI_LABELS.URL}
        headerActions={
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>{UI_LABELS.ADD_URL}</span>
          </Button>
        }
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : urlRules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No URL rules found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">{UI_LABELS.HOSTNAME}</th>
                  <th className="text-left p-2">{UI_LABELS.PATH_PATTERN}</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urlRules.map((rule) => (
                  <tr key={rule.id} className="border-b">
                    <td className="p-2">{rule.id.slice(0, 8)}...</td>
                    <td className="p-2">{rule.hostname}</td>
                    <td className="p-2">{rule.pathPattern}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(rule)}
                          title={UI_LABELS.EDIT}
                          className="flex items-center gap-1.5"
                        >
                          <FiEdit className="w-4 h-4" />
                          <span>{UI_LABELS.EDIT}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeletingRule({ id: rule.id, hostname: rule.hostname })}
                          title={UI_LABELS.DELETE}
                          className="flex items-center gap-1.5"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          {/* <span>{UI_LABELS.DELETE}</span> */}
                        </Button>
                      </div>
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
        open={isAddModalOpen || editingRule !== null}
        title={editingRule ? UI_LABELS.EDIT_URL : UI_LABELS.ADD_URL}
        description={UI_DESCRIPTIONS.PATH_PATTERN_HELP}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRule(null);
          createForm.reset();
          updateForm.reset();
        }}
        primaryAction={{
          label: UI_LABELS.SAVE,
          onClick: () => {
            if (editingRule) {
              updateForm.handleSubmit(handleUpdateSubmit)();
            } else {
              createForm.handleSubmit(handleCreateSubmit)();
            }
          },
          isLoading: editingRule ? updateMutation.isPending : createMutation.isPending,
        }}
        secondaryAction={{
          label: UI_LABELS.CANCEL,
          onClick: () => {
            setIsAddModalOpen(false);
            setEditingRule(null);
            createForm.reset();
            updateForm.reset();
          },
        }}
      >
        <form
          onSubmit={editingRule ? updateForm.handleSubmit(handleUpdateSubmit) : createForm.handleSubmit(handleCreateSubmit)}
          className="space-y-4"
        >
          {editingRule ? (
            <>
              <Controller
                name="hostname"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.HOSTNAME}
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="pathPattern"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.PATH_PATTERN}
                    {...field}
                    error={fieldState.error?.message}
                    helperText={UI_DESCRIPTIONS.PATH_PATTERN_HELP}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Controller
                name="hostname"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.HOSTNAME}
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="pathPattern"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.PATH_PATTERN}
                    {...field}
                    error={fieldState.error?.message}
                    helperText={UI_DESCRIPTIONS.PATH_PATTERN_HELP}
                  />
                )}
              />
            </>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deletingRule !== null}
        title={UI_LABELS.DELETE_URL}
        message={`${UI_LABELS.CONFIRM_DELETE_URL} (${deletingRule?.hostname})`}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
