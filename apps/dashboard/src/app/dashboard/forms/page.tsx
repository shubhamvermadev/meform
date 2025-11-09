"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, Button, Modal, ConfirmDialog, TextInput, Select, Checkbox } from "@meform/ui";
import { UI_LABELS, UI_DESCRIPTIONS, ROUTES, GOOGLE_SHEETS_SETUP_GUIDE } from "@meform/config";
import { useForms, useCreateForm, useUpdateForm, useDeleteForm, useForm } from "@/hooks/use-forms";
import { useUrlRules } from "@/hooks/use-url-rules";
import { useAppContext } from "@/contexts/AppContext";
import { CreateFormRequestSchema, UpdateFormRequestSchema } from "@meform/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useReactHookForm, Controller } from "react-hook-form";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { buildSectionId } from "@meform/utils";
import toast from "react-hot-toast";
import { FiEye, FiEdit, FiTrash2, FiCopy, FiCheck, FiPlus, FiSettings } from "react-icons/fi";

type CreateFormForm = z.infer<typeof CreateFormRequestSchema>;
type UpdateFormForm = z.infer<typeof UpdateFormRequestSchema>;

export default function FormsPage() {
  const router = useRouter();
  const { selectedAppId } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<{
    id: string;
    name: string;
    urlRuleId: string | null;
  } | null>(null);
  const [deletingForm, setDeletingForm] = useState<{ id: string; name: string } | null>(null);
  const [isGoogleSheetsGuideOpen, setIsGoogleSheetsGuideOpen] = useState(false);
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(false);

  const { data: forms = [], isLoading } = useForms(selectedAppId);
  const { data: urlRules = [] } = useUrlRules(selectedAppId);
  const { data: formData } = useForm(selectedAppId, editingForm?.id || "");
  const createMutation = useCreateForm(selectedAppId);
  const updateMutation = useUpdateForm(selectedAppId);
  const deleteMutation = useDeleteForm(selectedAppId);

  const createForm = useReactHookForm<CreateFormForm>({
    resolver: zodResolver(CreateFormRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      urlRuleId: undefined,
      renderAsSection: false,
      sharePublicly: true,
      googleSheets: undefined,
    },
  });

  const updateForm = useReactHookForm<UpdateFormForm>({
    resolver: zodResolver(UpdateFormRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      urlRuleId: undefined,
      renderAsSection: false,
      sharePublicly: true,
      googleSheets: undefined,
    },
  });

  // Update form when formData changes
  useEffect(() => {
    if (formData && editingForm) {
      const googleSheetsData = formData.googleSheets
        ? {
            enabled: formData.googleSheets.enabled,
            sheetName: formData.googleSheets.sheetName || "",
            webAppUrl: formData.googleSheets.webAppUrl || "",
            appScriptDeploymentId: formData.googleSheets.appScriptDeploymentId || undefined,
          }
        : undefined;

      setGoogleSheetsEnabled(!!googleSheetsData?.enabled);

      updateForm.reset({
        name: formData.name,
        urlRuleId: formData.urlRuleId || undefined,
        renderAsSection: formData.renderAsSection,
        sectionIdOverride: formData.sectionIdOverride || undefined,
        sharePublicly: formData.sharePublicly,
        googleSheets: googleSheetsData,
      });
    }
  }, [formData, editingForm, updateForm]);

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
  };

  const computedSectionId = useMemo(() => {
    if (!selectedAppId || !editingForm) return "";
    const formName = updateForm.watch("name") || editingForm.name;
    const override = updateForm.watch("sectionIdOverride");
    return override || buildSectionId(selectedAppId, formName);
  }, [selectedAppId, editingForm, updateForm]);

  const publicLink = useMemo(() => {
    if (!editingForm) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${ROUTES.PUBLIC.FORM(editingForm.id)}`;
  }, [editingForm]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} ${UI_LABELS.COPIED.toLowerCase()}`);
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
        <div className="text-center py-8 text-gray-500">Please select an application first</div>
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
          <Button
            onClick={() => {
              setIsAddModalOpen(true);
              setGoogleSheetsEnabled(false);
            }}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>{UI_LABELS.ADD_FORM}</span>
          </Button>
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
                  <th className="text-left p-2">Danger</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-b">
                    <td className="p-2">{form.id.slice(0, 8)}...</td>
                    <td className="p-2">{form.name}</td>
                    <td className="p-2">{form._count?.fields || 0}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="iconButton"
                          onClick={() => handleView(form.id)}
                          title={UI_LABELS.VIEW}
                          className="flex items-center gap-1.5"
                        >
                          <FiEye className="w-4 h-4" />
                          {/* <span>{UI_LABELS.VIEW}</span> */}
                        </Button>
                        {form.sharePublicly && (
                          <Button
                            size="sm"
                            variant="iconButton"
                            onClick={() => {
                              const link = `${window.location.origin}${ROUTES.PUBLIC.FORM(form.id)}`;
                              copyToClipboard(link, UI_LABELS.PUBLIC_LINK);
                            }}
                            title={UI_LABELS.COPY_PUBLIC_LINK}
                            className="flex items-center gap-1.5"
                          >
                            <FiCopy className="w-4 h-4" />
                            {/* <span>{UI_LABELS.COPY}</span> */}
                          </Button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(form)}
                          title={UI_LABELS.SETTING}
                          className="flex items-center gap-1.5"
                        >
                          {/* <FiEdit className="w-4 h-4" /> */}
                          <FiSettings className="w-4 h-4" />
                          {/* <span>{UI_LABELS.EDIT}</span> */}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeletingForm({ id: form.id, name: form.name })}
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
        open={isAddModalOpen || editingForm !== null}
        title={editingForm ? UI_LABELS.EDIT_FORM : UI_LABELS.ADD_FORM}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingForm(null);
          setGoogleSheetsEnabled(false);
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
          disabled: editingForm ? !updateForm.formState.isDirty : false,
        }}
        secondaryAction={{
          label: UI_LABELS.CANCEL,
          onClick: () => {
            setIsAddModalOpen(false);
            setEditingForm(null);
            setGoogleSheetsEnabled(false);
            createForm.reset();
            updateForm.reset();
          },
        }}
      >
        <form
          onSubmit={
            editingForm
              ? updateForm.handleSubmit(handleUpdateSubmit)
              : createForm.handleSubmit(handleCreateSubmit)
          }
          className="space-y-4"
        >
          <Controller
            name="name"
            control={editingForm ? updateForm.control : createForm.control}
            render={({ field, fieldState }) => (
              <TextInput label={UI_LABELS.NAME} {...field} error={fieldState.error?.message} />
            )}
          />
          <Controller
            name="urlRuleId"
            control={editingForm ? updateForm.control : createForm.control}
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

          {/* Render as Section */}
          <div className="space-y-2">
            <Controller
              name="renderAsSection"
              control={editingForm ? updateForm.control : createForm.control}
              render={({ field }) => (
                <Checkbox
                  label={UI_LABELS.RENDER_AS_SECTION}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  helperText={UI_DESCRIPTIONS.SECTION_RENDERING_HELP}
                />
              )}
            />
            {((editingForm && updateForm.watch("renderAsSection")) ||
              (!editingForm && createForm.watch("renderAsSection"))) && (
              <div className="ml-6 space-y-2">
                <div className="flex items-end items-center gap-2">
                  {/* <div className="flex-1"> */}
                    <TextInput
                      label={UI_LABELS.SECTION_ID}
                      value={
                        editingForm
                          ? computedSectionId
                          : selectedAppId
                            ? buildSectionId(selectedAppId, createForm.watch("name") || "")
                            : ""
                      }
                      readOnly
                      helperText={UI_DESCRIPTIONS.SECTION_ID_HELP}
                    />
                  {/* </div> */}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      copyToClipboard(
                        editingForm
                          ? computedSectionId
                          : selectedAppId
                            ? buildSectionId(selectedAppId, createForm.watch("name") || "")
                            : "",
                        UI_LABELS.SECTION_ID
                      )
                    }
                    className="flex items-center gap-1.5 mb-6"
                    title={UI_LABELS.COPY}
                  >
                    <FiCopy className="w-4 h-6" />
                    {/* <span>{UI_LABELS.COPY}</span> */}
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700">
                  <div className="mb-2">Usage:</div>
                  <div className="mb-1">{`<div id="${editingForm ? computedSectionId : selectedAppId ? buildSectionId(selectedAppId, createForm.watch("name") || "") : ""}"></div>`}</div>
                  <div className="mt-2 text-xs text-gray-500">or</div>
                  <div className="mt-1">{`<div data-meform="app:${selectedAppId};form:${editingForm?.id || ""}"></div>`}</div>
                </div>
                <Controller
                  name="sectionIdOverride"
                  control={editingForm ? updateForm.control : createForm.control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label={UI_LABELS.SECTION_ID_OVERRIDE}
                      {...field}
                      error={fieldState.error?.message}
                      helperText="Optional: Override the computed section ID"
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Share Publicly */}
          <Controller
            name="sharePublicly"
            control={editingForm ? updateForm.control : createForm.control}
            render={({ field }) => (
              <Checkbox
                label={UI_LABELS.SHARE_PUBLICLY}
                checked={field.value !== undefined ? field.value : true}
                onChange={(e) => field.onChange(e.target.checked)}
                helperText={UI_DESCRIPTIONS.PUBLIC_LINK_HELP}
              />
            )}
          />
          {editingForm && updateForm.watch("sharePublicly") && publicLink && (
            <div className="ml-6 flex items-end gap-2">
              <div className="flex-1">
                <TextInput label={UI_LABELS.PUBLIC_LINK} value={publicLink} readOnly />
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => copyToClipboard(publicLink, UI_LABELS.PUBLIC_LINK)}
                className="flex items-center gap-1.5"
                title={UI_LABELS.COPY}
              >
                <FiCopy className="w-4 h-7" />
                {/* <span>{UI_LABELS.COPY}</span> */}
              </Button>
            </div>
          )}

          {/* Google Sheets Integration */}
          <div className="space-y-2">
            <Controller
              name="googleSheets.enabled"
              control={editingForm ? updateForm.control : createForm.control}
              render={({ field }) => (
                <div>
                  <Checkbox
                    label={UI_LABELS.GOOGLE_SHEETS}
                    checked={field.value || false}
                    onChange={(e) => {
                      const isEnabled = e.target.checked;
                      field.onChange(isEnabled);
                      setGoogleSheetsEnabled(isEnabled);
                      if (!isEnabled) {
                        if (editingForm) {
                          updateForm.setValue("googleSheets", undefined);
                        } else {
                          createForm.setValue("googleSheets", undefined);
                        }
                      } else {
                        // Initialize googleSheets object when enabling
                        if (editingForm) {
                          const current = updateForm.getValues("googleSheets");
                          if (!current) {
                            updateForm.setValue("googleSheets", {
                              enabled: true,
                              sheetName: "",
                              webAppUrl: "",
                              appScriptDeploymentId: undefined,
                            });
                          }
                        } else {
                          const current = createForm.getValues("googleSheets");
                          if (!current) {
                            createForm.setValue("googleSheets", {
                              enabled: true,
                              sheetName: "",
                              webAppUrl: "",
                              appScriptDeploymentId: undefined,
                            });
                          }
                        }
                      }
                    }}
                    helperText={UI_DESCRIPTIONS.GOOGLE_SHEETS_HELP}
                  />
                  <button
                    type="button"
                    onClick={() => setIsGoogleSheetsGuideOpen(true)}
                    className="text-sm text-blue-600 hover:underline ml-6 mt-1"
                  >
                    {UI_LABELS.VIEW_SETUP_GUIDE}
                  </button>
                </div>
              )}
            />
            {googleSheetsEnabled && (
              <div className="ml-6 space-y-2">
                <Controller
                  name="googleSheets.sheetName"
                  control={editingForm ? updateForm.control : createForm.control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label={UI_LABELS.SHEET_NAME}
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="googleSheets.webAppUrl"
                  control={editingForm ? updateForm.control : createForm.control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label={UI_LABELS.WEB_APP_URL}
                      type="url"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="googleSheets.appScriptDeploymentId"
                  control={editingForm ? updateForm.control : createForm.control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label={UI_LABELS.APP_SCRIPT_DEPLOYMENT_ID}
                      {...field}
                      error={fieldState.error?.message}
                      helperText="Optional: For tracking purposes"
                    />
                  )}
                />
              </div>
            )}
          </div>
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

      {/* Google Sheets Setup Guide Modal */}
      <Modal
        open={isGoogleSheetsGuideOpen}
        title="Google Sheets Setup Guide"
        onClose={() => setIsGoogleSheetsGuideOpen(false)}
        primaryAction={{
          label: UI_LABELS.CLOSE,
          onClick: () => setIsGoogleSheetsGuideOpen(false),
        }}
      >
        <div 
          className="prose max-w-none overflow-auto max-h-[70vh] text-sm"
          dangerouslySetInnerHTML={{ __html: GOOGLE_SHEETS_SETUP_GUIDE }}
        />
      </Modal>
    </>
  );
}
