"use client";

import { useState } from "react";
import { ROUTES } from "@meform/config";
import { Button, TextInput } from "@meform/ui";
import type { FormField } from "@meform/dto";

interface PublicFormPageProps {
  form: {
    id: string;
    name: string;
    applicationId: string;
    fields: Array<{
      id: string;
      name: string;
      key: string;
      type: string;
      required: boolean;
      placeholder: string | null;
      options: unknown;
    }>;
  };
}

export function PublicFormPage({ form }: PublicFormPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Honeypot check
    const honeypot = (e.target as HTMLFormElement).querySelector(
      'input[name="dataCheck"]'
    ) as HTMLInputElement;
    if (honeypot?.value) {
      setSubmitStatus("error");
      setErrorMessage("Invalid submission");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {};
      Object.entries(formData).forEach(([key, value]) => {
        payload[key] = value;
      });

      const response = await fetch(ROUTES.PUBLIC.SUBMIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: form.applicationId,
          formId: form.id,
          hostname: window.location.hostname,
          path: window.location.pathname,
          payload,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Submission failed");
      }

      setSubmitStatus("success");
      setFormData({});
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "TEXTAREA":
        return (
          <textarea
            name={field.key}
            placeholder={field.placeholder || ""}
            required={field.required}
            value={(formData[field.key] as string) || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-lightGray rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
            rows={4}
          />
        );
      case "EMAIL":
        return (
          <input
            type="email"
            name={field.key}
            placeholder={field.placeholder || ""}
            required={field.required}
            value={(formData[field.key] as string) || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-lightGray rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
          />
        );
      case "PHONE":
        return (
          <input
            type="tel"
            name={field.key}
            placeholder={field.placeholder || ""}
            required={field.required}
            value={(formData[field.key] as string) || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-lightGray rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
          />
        );
      case "NUMBER":
        return (
          <input
            type="number"
            name={field.key}
            placeholder={field.placeholder || ""}
            required={field.required}
            value={(formData[field.key] as string) || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-lightGray rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
          />
        );
      case "CHECKBOX":
        const checkboxOptions = field.options as Record<string, string> | null;
        if (!checkboxOptions) {
          return (
            <input
              type="checkbox"
              name={field.key}
              required={field.required}
              checked={(formData[field.key] as boolean) || false}
              onChange={(e) => handleFieldChange(field.key, e.target.checked ? "true" : "")}
              className="h-4 w-4 text-accent focus:ring-accent border-lightGray rounded"
            />
          );
        }
        return (
          <div className="space-y-2">
            {Object.entries(checkboxOptions).map(([value, label]) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  name={field.key}
                  value={value}
                  checked={(formData[field.key] as string[])?.includes(value) || false}
                  onChange={(e) => {
                    const current = (formData[field.key] as string[]) || [];
                    const updated = e.target.checked
                      ? [...current, value]
                      : current.filter((v) => v !== value);
                    handleFieldChange(field.key, updated);
                  }}
                  className="h-4 w-4 text-accent focus:ring-accent border-lightGray rounded mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        );
      case "RADIO":
        const radioOptions = field.options as Record<string, string> | null;
        if (!radioOptions) {
          return (
            <input
              type="radio"
              name={field.key}
              value="yes"
              required={field.required}
              checked={(formData[field.key] as string) === "yes"}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="h-4 w-4 text-accent focus:ring-accent border-lightGray"
            />
          );
        }
        return (
          <div className="space-y-2">
            {Object.entries(radioOptions).map(([value, label]) => (
              <label key={value} className="flex items-center">
                <input
                  type="radio"
                  name={field.key}
                  value={value}
                  required={field.required}
                  checked={(formData[field.key] as string) === value}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="h-4 w-4 text-accent focus:ring-accent border-lightGray mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
            type="text"
            name={field.key}
            placeholder={field.placeholder || ""}
            required={field.required}
            value={(formData[field.key] as string) || ""}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-lightGray rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
          />
        );
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-backgroundSoft">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-lightGray p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-dark mb-2">Thank You!</h1>
          <p className="text-gray">Your submission has been received successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-backgroundSoft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-lightGray p-8">
          <h1 className="text-3xl font-bold text-dark mb-6">{form.name}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field */}
            <input type="text" name="dataCheck" tabIndex={-1} autoComplete="off" className="hidden" />

            {form.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray mb-2">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{errorMessage || "An error occurred. Please try again."}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}


