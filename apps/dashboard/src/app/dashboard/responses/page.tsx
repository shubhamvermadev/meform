"use client";

import { useState, useEffect } from "react";
import { Card, Select } from "@meform/ui";
import { UI_LABELS } from "@meform/config";
import { useSubmissions } from "@/hooks/use-submissions";
import { useForms } from "@/hooks/use-forms";
import { useFormFields } from "@/hooks/use-form-fields";
import { useAppContext } from "@/contexts/AppContext";
import type { ListSubmissionsQuery } from "@meform/dto";

export default function ResponsesPage() {
  const { selectedAppId } = useAppContext();
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [queryParams, setQueryParams] = useState<ListSubmissionsQuery>({
    page: 1,
    pageSize: 20,
  });

  const { data: forms = [] } = useForms(selectedAppId);
  const { data: submissionsData, isLoading } = useSubmissions(selectedAppId, {
    ...queryParams,
    formId: selectedFormId || undefined,
  });
  const { data: formFields = [] } = useFormFields(
    selectedAppId || "",
    selectedFormId
  );

  // Reset form selection when app changes
  useEffect(() => {
    setSelectedFormId("");
  }, [selectedAppId]);

  // Set first form as selected by default when forms load
  useEffect(() => {
    if (forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id);
    }
  }, [forms, selectedFormId]);

  const formOptions = forms.map((form) => ({
    value: form.id,
    label: form.name,
  }));

  if (!selectedAppId) {
    return (
      <Card title={UI_LABELS.VISITOR_RESPONSES}>
        <div className="text-center py-8 text-gray-500">
          Please select an application first
        </div>
      </Card>
    );
  }

  const submissions = submissionsData?.data || [];
  const meta = submissionsData?.meta;

  // Helper function to format payload value
  const formatPayloadValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <Card
      title={UI_LABELS.VISITOR_RESPONSES}
      headerActions={
        forms.length > 0 && (
          <Select
            options={formOptions}
            value={selectedFormId}
            onChange={(e) => {
              setSelectedFormId(e.target.value);
              setQueryParams({ ...queryParams, page: 1 }); // Reset to first page when form changes
            }}
            className="w-48"
          />
        )
      }
    >
      {!selectedFormId ? (
        <div className="text-center py-8 text-gray-500">
          {forms.length === 0 ? "No forms found" : "Please select a form"}
        </div>
      ) : isLoading ? (
        <div>Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No submissions found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  {formFields.map((field) => (
                    <th key={field.id} className="text-left p-2 font-medium">
                      {field.name}
                    </th>
                  ))}
                  <th className="text-left p-2 font-medium">Hostname</th>
                  <th className="text-left p-2 font-medium">Path</th>
                  <th className="text-left p-2 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b hover:bg-gray-50">
                    {formFields.map((field) => (
                      <td key={field.id} className="p-2">
                        {formatPayloadValue(submission.payload[field.key])}
                      </td>
                    ))}
                    <td className="p-2">{submission.hostname}</td>
                    <td className="p-2">{submission.path}</td>
                    <td className="p-2">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setQueryParams({ ...queryParams, page: (meta.page || 1) - 1 })}
                  disabled={meta.page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setQueryParams({ ...queryParams, page: (meta.page || 1) + 1 })}
                  disabled={meta.page >= meta.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
