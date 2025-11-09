"use client";

import { Modal, TextInput, TextArea } from "@meform/ui";
import { UI_LABELS, UI_DESCRIPTIONS } from "@meform/config";
import { useCreateApplication } from "@/hooks/use-applications";
import { CreateApplicationRequestSchema } from "@meform/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
import type { CreateApplicationRequest, TApplicationResponse } from "@meform/dto";

type CreateApplicationForm = z.infer<typeof CreateApplicationRequestSchema>;

export interface ApplicationCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (app: TApplicationResponse) => void;
}

export function ApplicationCreateDialog({
  open,
  onClose,
  onCreated,
}: ApplicationCreateDialogProps) {
  const createMutation = useCreateApplication();

  const form = useForm<CreateApplicationForm>({
    resolver: zodResolver(CreateApplicationRequestSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      hostname: "",
      description: "",
    },
  });

  const handleSubmit = async (data: CreateApplicationForm) => {
    try {
      // Clean up empty description - transform empty string to undefined
      const payload: CreateApplicationRequest = {
        name: data.name.trim(),
        hostname: data.hostname.trim(),
        description: data.description?.trim() || undefined,
      };
      const app = await createMutation.mutateAsync(payload);
      form.reset();
      onClose();
      if (onCreated) {
        onCreated(app);
      }
    } catch (error) {
      // Error handled by mutation (toast)
    }
  };

  const onSubmit = form.handleSubmit(handleSubmit);

  return (
    <Modal
      open={open}
      title={UI_LABELS.CREATE_APPLICATION}
      description={UI_DESCRIPTIONS.APP_CREATE_DESC}
      onClose={onClose}
      primaryAction={{
        label: UI_LABELS.SAVE,
        onClick: () => {
          onSubmit();
        },
        isLoading: createMutation.isPending,
        disabled: createMutation.isPending,
      }}
      secondaryAction={{
        label: UI_LABELS.CANCEL,
        onClick: () => {
          form.reset();
          onClose();
        },
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4" id="create-application-form">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              label={UI_LABELS.APP_NAME}
              {...field}
              error={fieldState.error?.message}
              autoFocus
            />
          )}
        />
        <Controller
          name="hostname"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              label={UI_LABELS.APP_HOSTNAME}
              {...field}
              error={fieldState.error?.message}
              helperText={UI_DESCRIPTIONS.APP_HOSTNAME_HELPER}
            />
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextArea
              label={UI_LABELS.APP_DESCRIPTION}
              {...field}
              error={fieldState.error?.message}
              rows={3}
            />
          )}
        />
        <button type="submit" className="hidden" aria-hidden="true" />
      </form>
    </Modal>
  );
}

