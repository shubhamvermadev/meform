"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  ConfirmDialog,
  TextInput,
  Select,
  TextArea,
  Checkbox,
} from "@meform/ui";
import { UI_LABELS, UI_DESCRIPTIONS, FIELD_TYPES, type FieldType } from "@meform/config";
import { isFieldType } from "@/utils/type-guards";
import {
  useFormFields,
  useCreateFormField,
  useUpdateFormField,
  useDeleteFormField,
} from "@/hooks/use-form-fields";
import { useForm as useFormData } from "@/hooks/use-forms";
import { useAppContext } from "@/contexts/AppContext";
import { CreateFormFieldRequestSchema, UpdateFormFieldRequestSchema } from "@meform/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
import { z as zod } from "zod";
import { useRouter } from "next/navigation";
import { ROUTES } from "@meform/config";
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft } from "react-icons/fi";
import { slugify } from "@meform/utils";

type CreateFieldForm = z.infer<typeof CreateFormFieldRequestSchema> & { options?: string };
type UpdateFieldForm = z.infer<typeof UpdateFormFieldRequestSchema> & { options?: string };

export default function FormFieldsPage({ params }: { params: { formId: string } }) {
  const router = useRouter();
  const { selectedAppId } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{
    id: string;
    name: string;
    key: string;
    type: string;
    required: boolean;
    placeholder: string | null;
    options: unknown;
    position: number;
  } | null>(null);
  const [deletingField, setDeletingField] = useState<{ id: string; name: string } | null>(null);

  const formId = params.formId;

  const { data: form } = useFormData(selectedAppId, formId);
  const { data: fields = [], isLoading } = useFormFields(selectedAppId, formId);
  const createMutation = useCreateFormField(selectedAppId, formId);
  const updateMutation = useUpdateFormField(selectedAppId, formId);
  const deleteMutation = useDeleteFormField(selectedAppId, formId);

  const createForm = useForm<CreateFieldForm>({
    resolver: zodResolver(
      CreateFormFieldRequestSchema.extend({
        options: zod.string().optional(),
      })
    ),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      key: "",
      type: "TEXT",
      required: false,
      placeholder: "",
      options: "",
      position: fields.length,
    },
  });

  const updateForm = useForm<UpdateFieldForm>({
    resolver: zodResolver(
      UpdateFormFieldRequestSchema.extend({
        options: zod.string().optional(),
      })
    ),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      key: "",
      type: "TEXT",
      required: false,
      placeholder: "",
      options: "",
      position: 0,
    },
  });

  // Auto-generate key from name
  const handleNameChange = (name: string, onChange: (value: string) => void, isEdit = false) => {
    onChange(name);
    if (!isEdit) {
      const generatedKey = slugify(name);
      createForm.setValue("key", generatedKey);
    }
  };

  // const handleCreateSubmit = async (data: CreateFieldForm) => {
  //   try {
  //     // Parse options if type is CHECKBOX or RADIO
  //     let parsedOptions: unknown = null;
  //     if ((data.type === "CHECKBOX" || data.type === "RADIO") && data.options) {
  //       try {
  //         const optionsStr = String(data.options);
  //         if (optionsStr.trim()) {
  //           const parsed = JSON.parse(optionsStr);
  //           // Convert array to object if needed (for user-friendly input)
  //           if (Array.isArray(parsed)) {
  //             parsedOptions = Object.fromEntries(
  //               parsed.map((item, index) => {
  //                 const value = typeof item === "string" ? item.toLowerCase().replace(/\s+/g, "_") : `option${index + 1}`;
  //                 const label = typeof item === "string" ? item : String(item);
  //                 return [value, label];
  //               })
  //             );
  //           } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
  //             parsedOptions = parsed;
  //           } else {
  //             throw new Error("Options must be an array or object");
  //           }
  //         }
  //       } catch (error) {
  //         throw new Error(error instanceof Error ? error.message : "Invalid JSON in options field");
  //       }
  //     }
  //     const submitData = {
  //       ...data,
  //       options: parsedOptions,
  //     };
  //     await createMutation.mutateAsync(submitData);
  //     setIsAddModalOpen(false);
  //     createForm.reset();
  //   } catch (error) {
  //     // Error handled by mutation
  //   }
  // };

  // if not working check above method
  const handleCreateSubmit = async (data: CreateFieldForm) => {
    try {
      // Parse options if type is CHECKBOX or RADIO
      let parsedOptions: unknown = null;
      if ((data.type === "CHECKBOX" || data.type === "RADIO") && data.options) {
        try {
          const optionsStr = String(data.options);
          if (optionsStr.trim()) {
            const parsed = JSON.parse(optionsStr);
            // Convert array to object if needed (for user-friendly input)
            if (Array.isArray(parsed)) {
              parsedOptions = Object.fromEntries(
                parsed.map((item, index) => {
                  const value =
                    typeof item === "string"
                      ? item.toLowerCase().replace(/\s+/g, "_")
                      : `option${index + 1}`;
                  const label = typeof item === "string" ? item : String(item);
                  return [value, label];
                })
              );
            } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
              parsedOptions = parsed;
            } else {
              throw new Error("Options must be an array or object");
            }
          }
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Invalid JSON in options field");
        }
      }
      const submitData = {
        ...data,
        options: parsedOptions,
      };
      await createMutation.mutateAsync(submitData);
      setIsAddModalOpen(false);
      createForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (field: {
    id: string;
    name: string;
    key: string;
    type: string;
    required: boolean;
    placeholder: string | null;
    options: unknown;
    position: number;
  }) => {
    setEditingField(field);
    updateForm.reset({
      name: field.name,
      key: field.key,
      type: field.type as "TEXT" | "TEXTAREA" | "EMAIL" | "PHONE" | "NUMBER" | "CHECKBOX" | "RADIO",
      required: field.required,
      placeholder: field.placeholder || "",
      options: field.options ? JSON.stringify(field.options, null, 2) : "",
      position: field.position,
    });
  };

  const handleUpdateSubmit = async (data: UpdateFieldForm) => {
    if (!editingField) return;
    try {
      // Parse options if type is CHECKBOX or RADIO
      let parsedOptions: unknown = null;
      if ((data.type === "CHECKBOX" || data.type === "RADIO") && data.options) {
        try {
          const optionsStr = String(data.options);
          if (optionsStr.trim()) {
            const parsed = JSON.parse(optionsStr);
            // Convert array to object if needed (for user-friendly input)
            if (Array.isArray(parsed)) {
              parsedOptions = Object.fromEntries(
                parsed.map((item, index) => {
                  const value =
                    typeof item === "string"
                      ? item.toLowerCase().replace(/\s+/g, "_")
                      : `option${index + 1}`;
                  const label = typeof item === "string" ? item : String(item);
                  return [value, label];
                })
              );
            } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
              parsedOptions = parsed;
            } else {
              throw new Error("Options must be an array or object");
            }
          }
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Invalid JSON in options field");
        }
      }
      const submitData = {
        ...data,
        options: parsedOptions,
      };
      await updateMutation.mutateAsync({ fieldId: editingField.id, data: submitData });
      setEditingField(null);
      updateForm.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deletingField) return;
    try {
      await deleteMutation.mutateAsync(deletingField.id);
      setDeletingField(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const fieldTypeOptions = Object.values(FIELD_TYPES).map((type) => ({
    value: type,
    label: type,
  }));

  if (!selectedAppId || !formId) {
    return (
      <Card title={UI_LABELS.FIELDS}>
        <div className="text-center py-8 text-gray">Loading...</div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <div className="flex items-center gap-4">
            <Button
              variant="iconButton"
              size="sm"
              onClick={() => router.push(ROUTES.DASHBOARD.FORMS)}
            >
              <FiArrowLeft className="w-5 h-5" />
              {/* {UI_LABELS.BACK} */}
            </Button>
            <span className="font-semibold">{form?.name}</span>
          </div>
        }
        headerActions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>{UI_LABELS.ADD_FIELD}</span>
          </Button>
        }
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : fields.length === 0 ? (
          <div className="text-center py-8 text-gray">No fields found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-lightGray bg-hoverGray">
                  <th className="text-left p-3 text-xs font-medium text-gray uppercase tracking-wide">ID</th>
                  <th className="text-left p-3 text-xs font-medium text-gray uppercase tracking-wide">{UI_LABELS.NAME}</th>
                  <th className="text-left p-3 text-xs font-medium text-gray uppercase tracking-wide">{UI_LABELS.KEY}</th>
                  <th className="text-left p-3 text-xs font-medium text-gray uppercase tracking-wide">{UI_LABELS.FIELD_TYPE}</th>
                  <th className="text-left p-3 text-xs font-medium text-gray uppercase tracking-wide">{UI_LABELS.REQUIRED}</th>
                  <th className="text-left p-3 text-xs font-medium text-gray uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className="border-b border-lightGray hover:bg-hoverGray">
                    <td className="p-3 text-sm">{field.id.slice(0, 8)}...</td>
                    <td className="p-3 text-sm">{field.name}</td>
                    <td className="p-3 text-sm">{field.key}</td>
                    <td className="p-3 text-sm">{field.type}</td>
                    <td className="p-3 text-sm">{field.required ? "Yes" : "No"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="iconButton"
                          onClick={() => handleEdit(field)}
                          title={UI_LABELS.EDIT}
                          className="flex items-center gap-1.5"
                        >
                          <FiEdit className="w-4 h-4" />
                          {/* <span>{UI_LABELS.EDIT}</span> */}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeletingField({ id: field.id, name: field.name })}
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
        open={isAddModalOpen || editingField !== null}
        title={editingField ? UI_LABELS.EDIT_FIELD : UI_LABELS.ADD_FIELD}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingField(null);
          createForm.reset();
          updateForm.reset();
        }}
        primaryAction={{
          label: UI_LABELS.SAVE,
          onClick: () => {
            if (editingField) {
              updateForm.handleSubmit(handleUpdateSubmit)();
            } else {
              createForm.handleSubmit(handleCreateSubmit)();
            }
          },
          isLoading: editingField ? updateMutation.isPending : createMutation.isPending,
        }}
        secondaryAction={{
          label: UI_LABELS.CANCEL,
          onClick: () => {
            setIsAddModalOpen(false);
            setEditingField(null);
            createForm.reset();
            updateForm.reset();
          },
        }}
      >
        <form
          onSubmit={
            editingField
              ? updateForm.handleSubmit(handleUpdateSubmit)
              : createForm.handleSubmit(handleCreateSubmit)
          }
          className="space-y-4"
        >
          {editingField ? (
            <>
              <Controller
                name="name"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput label={UI_LABELS.NAME} {...field} error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="key"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.KEY}
                    {...field}
                    error={fieldState.error?.message}
                    helperText={UI_DESCRIPTIONS.FIELD_KEY_HELP}
                  />
                )}
              />
              <Controller
                name="type"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <Select
                    label={UI_LABELS.FIELD_TYPE}
                    options={fieldTypeOptions}
                    value={field.value || "TEXT"}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isFieldType(value)) {
                        field.onChange(value);
                      }
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="placeholder"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.PLACEHOLDER}
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="required"
                control={updateForm.control}
                render={({ field }) => (
                  <Checkbox
                    label={UI_LABELS.REQUIRED}
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              {(updateForm.watch("type") === "CHECKBOX" ||
                updateForm.watch("type") === "RADIO") && (
                <Controller
                  name="options"
                  control={updateForm.control}
                  render={({ field, fieldState }) => (
                    <TextArea
                      label={UI_LABELS.OPTIONS}
                      {...field}
                      error={fieldState.error?.message}
                      helperText={UI_DESCRIPTIONS.FIELD_OPTIONS_HELP}
                      rows={4}
                    />
                  )}
                />
              )}
              <Controller
                name="position"
                control={updateForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    type="number"
                    label={UI_LABELS.POSITION}
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => {
                      handleNameChange(e.target.value, field.onChange);
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="key"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.KEY}
                    {...field}
                    error={fieldState.error?.message}
                    helperText={UI_DESCRIPTIONS.FIELD_KEY_HELP}
                  />
                )}
              />
              <Controller
                name="type"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <Select
                    label={UI_LABELS.FIELD_TYPE}
                    options={fieldTypeOptions}
                    value={field.value || "TEXT"}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isFieldType(value)) {
                        field.onChange(value);
                      }
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="placeholder"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label={UI_LABELS.PLACEHOLDER}
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="required"
                control={createForm.control}
                render={({ field }) => (
                  <Checkbox
                    label={UI_LABELS.REQUIRED}
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              {(createForm.watch("type") === "CHECKBOX" ||
                createForm.watch("type") === "RADIO") && (
                <Controller
                  name="options"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextArea
                      label={UI_LABELS.OPTIONS}
                      {...field}
                      error={fieldState.error?.message}
                      helperText={UI_DESCRIPTIONS.FIELD_OPTIONS_HELP}
                      rows={4}
                    />
                  )}
                />
              )}
              <Controller
                name="position"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    type="number"
                    label={UI_LABELS.POSITION}
                    {...field}
                    value={field.value ?? fields.length}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
        open={deletingField !== null}
        title={UI_LABELS.DELETE_FIELD}
        message={`${UI_LABELS.CONFIRM_DELETE_FIELD} (${deletingField?.name})`}
        onClose={() => setDeletingField(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
