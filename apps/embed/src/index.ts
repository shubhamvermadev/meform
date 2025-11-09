/**
 * meform Embed SDK
 * Vanilla TypeScript embeddable script
 */

// Inline constants (no external dependencies)
const PALETTE = {
  dark: "#201e1f",
  accent: "#ff4000",
  accentSoft: "#faaa8d",
  backgroundSoft: "#feefdd",
  info: "#50b2c0",
};

// Note: Hostname normalization and path matching are handled server-side

interface FormField {
  id: string;
  name: string;
  key: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  options: unknown;
}

interface Form {
  formId: string;
  name: string;
  renderAsSection: boolean;
  computedSectionId: string;
  canRenderWidget: boolean;
  fields: FormField[];
}

interface ConfigResponse {
  applicationStatus: string;
  widgetAllowed: boolean;
  matches: Form[];
}

class MeformWidget {
  private applicationId: string;
  private baseUrl: string;
  private shadowRoot: ShadowRoot | null = null;
  private container: HTMLElement | null = null;
  private isOpen = false;
  private currentForm: Form | null = null;
  private widgetSuppressed = false;

  constructor(applicationId: string, baseUrl = "") {
    this.applicationId = applicationId;
    this.baseUrl = baseUrl || window.location.origin;
  }

  /**
   * Initializes the widget
   */
  async init(): Promise<void> {
    const hostname = window.location.hostname;
    const path = window.location.pathname;

    try {
      const config = await this.fetchConfig(hostname, path);
      
      // Validate config structure
      if (!config || typeof config !== "object") {
        console.error("meform: Invalid config response");
        return;
      }

      // Check application status
      if (config.applicationStatus === "DISABLED" || !config.widgetAllowed) {
        return; // Application is disabled
      }

      // Ensure matches exists and is an array
      if (!config.matches || !Array.isArray(config.matches)) {
        console.error("meform: Config missing matches array");
        return;
      }

      if (config.matches.length === 0) {
        return; // No forms to show
      }

      // Process forms for section rendering
      for (const form of config.matches) {
        if (form.renderAsSection) {
          const container = this.findSectionContainer(form);
          if (container) {
            this.renderSection(container, form);
            this.widgetSuppressed = true;
          }
        }
      }

      // Render widget if allowed and no sections were rendered
      if (!this.widgetSuppressed) {
        // Find first form that allows widget rendering
        const widgetForm = config.matches.find((f) => f.canRenderWidget);
        if (widgetForm) {
          this.currentForm = widgetForm;
          this.renderButton();
        }
      } else {
        // Use first form for section rendering context
        this.currentForm = config.matches[0];
      }
    } catch (error) {
      console.error("meform: Failed to load config", error);
    }
  }

  /**
   * Finds the container element for section rendering
   */
  private findSectionContainer(form: Form): HTMLElement | null {
    // Priority 1: ID match
    const byId = document.getElementById(form.computedSectionId);
    if (byId) return byId;

    // Priority 2: Data attribute match
    const byDataAttr = document.querySelector(
      `[data-meform="app:${this.applicationId};form:${form.formId}"]`
    ) as HTMLElement;
    if (byDataAttr) return byDataAttr;

    return null;
  }

  /**
   * Renders form inline in a section container
   */
  private renderSection(container: HTMLElement, form: Form): void {
    // For sections, render directly into the container (no shadow DOM for full-width)
    this.currentForm = form;
    this.renderSectionContent(container, form);
  }

  /**
   * Fetches form configuration
   */
  private async fetchConfig(hostname: string, path: string): Promise<ConfigResponse> {
    const url = new URL("/public/v1/config", this.baseUrl);
    url.searchParams.set("applicationId", this.applicationId);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "X-Hostname": hostname,
          "X-Path": path,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error("meform: Config fetch failed", {
          status: response.status,
          statusText: response.statusText,
          url: url.toString(),
          errorText,
        });
        throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("meform: Config fetch error", {
        url: url.toString(),
        baseUrl: this.baseUrl,
        applicationId: this.applicationId,
        error,
      });
      throw error;
    }
  }

  /**
   * Renders the floating button
   */
  private renderButton(): void {
    const button = document.createElement("div");
    button.id = "meform-button";
    button.innerHTML = `
      <style>
        #meform-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-color: ${PALETTE.accent};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 10000;
          transition: transform 0.2s;
        }
        #meform-button:hover {
          transform: scale(1.1);
        }
        #meform-button::before {
          content: "📝";
          font-size: 24px;
        }
      </style>
    `;

    button.addEventListener("click", () => this.open());
    document.body.appendChild(button);
  }

  /**
   * Opens the form popup
   */
  open(): void {
    if (this.isOpen || !this.currentForm) {
      return;
    }

    this.isOpen = true;
    this.renderForm();
  }

  /**
   * Closes the form popup
   */
  close(): void {
    if (!this.isOpen) {
      return;
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.shadowRoot = null;
    this.isOpen = false;
  }

  /**
   * Renders the form in a popup
   */
  private renderForm(): void {
    if (!this.currentForm) {
      return;
    }

    // Create container with Shadow DOM
    this.container = document.createElement("div");
    this.container.id = "meform-popup";
    this.shadowRoot = this.container.attachShadow({ mode: "closed" });
    this.renderFormContent(this.shadowRoot, this.currentForm);
    document.body.appendChild(this.container);
  }

  /**
   * Renders form content in a shadow root (for popup widget)
   */
  private renderFormContent(shadowRoot: ShadowRoot, form: Form): void {
    const styles = `
      :host {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 400px;
        max-height: 600px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        display: flex;
        flex-direction: column;
      }
      .header {
        padding: 16px;
        background: ${PALETTE.accent};
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
      }
      .content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      .field {
        margin-bottom: 16px;
      }
      label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: ${PALETTE.dark};
      }
      input, textarea, select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }
      textarea {
        min-height: 80px;
        resize: vertical;
      }
      .submit-btn {
        width: 100%;
        padding: 12px;
        background: ${PALETTE.accent};
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 8px;
      }
      .submit-btn:hover {
        background: ${PALETTE.accentSoft};
      }
      .error {
        color: red;
        font-size: 12px;
        margin-top: 4px;
      }
    `;

    const formHTML = `
      <style>${styles}</style>
      <div class="header">
        <h3 style="margin: 0;">${form.name}</h3>
        <button class="close-btn" id="close-btn">×</button>
      </div>
      <div class="content">
        <form id="meform-form">
          ${form.fields
            .map(
              (field) => `
            <div class="field">
              <label>${field.name}${field.required ? " *" : ""}</label>
              ${this.renderFieldInput(field)}
            </div>
          `
            )
            .join("")}
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
    `;

    shadowRoot.innerHTML = formHTML;

    // Attach event listeners
    const closeBtn = shadowRoot.querySelector("#close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    const formElement = shadowRoot.querySelector("#meform-form") as HTMLFormElement;
    if (formElement) {
      formElement.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  /**
   * Renders form as a full-width section (no shadow DOM)
   */
  private renderSectionContent(container: HTMLElement, form: Form): void {
    const styleId = "meform-section-styles";
    
    // Add styles to document head if not already present
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .meform-section {
          width: 100%;
          display: block;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        .meform-section .meform-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }
        .meform-section .meform-inner {
          width: 100%;
          max-width: 500px;
        }
        .meform-section .meform-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .meform-section .meform-header h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: ${PALETTE.dark};
        }
        .meform-section .meform-content {
          width: 100%;
        }
        .meform-section .meform-field {
          margin-bottom: 20px;
        }
        .meform-section .meform-field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: ${PALETTE.dark};
          font-size: 14px;
        }
        .meform-section .meform-field input,
        .meform-section .meform-field textarea,
        .meform-section .meform-field select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
          font-family: inherit;
        }
        .meform-section .meform-field textarea {
          min-height: 100px;
          resize: vertical;
        }
        .meform-section .meform-submit-btn {
          width: 100%;
          padding: 14px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, opacity 0.2s;
        }
        .meform-section .meform-submit-btn:hover:not(:disabled) {
          background: #2563eb;
        }
        .meform-section .meform-submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .meform-section .meform-error {
          color: red;
          font-size: 12px;
          margin-top: 4px;
        }
        .meform-section .meform-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .meform-section .meform-checkbox-item {
          display: flex;
          align-items: center;
        }
        .meform-section .meform-checkbox-item input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }
        .meform-section .meform-radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .meform-section .meform-radio-item {
          display: flex;
          align-items: center;
        }
        .meform-section .meform-radio-item input[type="radio"] {
          width: auto;
          margin-right: 8px;
        }
      `;
      document.head.appendChild(style);
    }

    const formHTML = `
      <div class="meform-wrapper">
        <div class="meform-inner">
          <div class="meform-header">
            <h3>${form.name}</h3>
          </div>
          <div class="meform-content">
            <form class="meform-form" id="meform-section-form-${form.formId}">
              ${form.fields
                .map(
                  (field) => `
                <div class="meform-field">
                  <label>${field.name}${field.required ? " *" : ""}</label>
                  ${this.renderFieldInputForSection(field)}
                </div>
              `
                )
                .join("")}
              <button type="submit" class="meform-submit-btn" id="meform-submit-btn-${form.formId}" disabled>Submit</button>
            </form>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = formHTML;
    container.classList.add("meform-section");

    // Attach event listeners
    const formElement = container.querySelector(`#meform-section-form-${form.formId}`) as HTMLFormElement;
    const submitButton = container.querySelector(`#meform-submit-btn-${form.formId}`) as HTMLButtonElement;
    
    if (formElement && submitButton) {
      // Validate form on input/change to enable/disable submit button
      const validateForm = () => {
        const formData = new FormData(formElement);
        let allRequiredFilled = true;

        for (const field of form.fields) {
          if (field.required) {
            const value = formData.get(field.key);
            if (field.type === "CHECKBOX") {
              // For checkboxes, check if at least one is checked
              const checkboxes = formElement.querySelectorAll(`input[name="${field.key}"]:checked`);
              if (checkboxes.length === 0) {
                allRequiredFilled = false;
                break;
              }
            } else if (field.type === "RADIO") {
              // For radio buttons, check if one is selected
              const radios = formElement.querySelectorAll(`input[name="${field.key}"]:checked`);
              if (radios.length === 0) {
                allRequiredFilled = false;
                break;
              }
            } else {
              if (!value || (typeof value === "string" && value.trim() === "")) {
                allRequiredFilled = false;
                break;
              }
            }
          }
        }

        submitButton.disabled = !allRequiredFilled;
      };

      // Add event listeners to all form inputs
      const inputs = formElement.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        input.addEventListener("input", validateForm);
        input.addEventListener("change", validateForm);
      });

      // Initial validation
      validateForm();

      // Handle form submission
      formElement.addEventListener("submit", (e) => this.handleSectionSubmit(e, form));
    }
  }

  /**
   * Renders field input based on type (for popup widget)
   */
  private renderFieldInput(field: FormField): string {
    switch (field.type) {
      case "TEXTAREA":
        return `<textarea name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}></textarea>`;
      case "EMAIL":
        return `<input type="email" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
      case "PHONE":
        return `<input type="tel" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
      case "NUMBER":
        return `<input type="number" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
      case "CHECKBOX":
        return this.renderCheckbox(field);
      case "RADIO":
        return this.renderRadio(field);
      default:
        return `<input type="text" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
    }
  }

  /**
   * Renders field input based on type (for full-width section)
   */
  private renderFieldInputForSection(field: FormField): string {
    switch (field.type) {
      case "TEXTAREA":
        return `<textarea name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}></textarea>`;
      case "EMAIL":
        return `<input type="email" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
      case "PHONE":
        return `<input type="tel" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
      case "NUMBER":
        return `<input type="number" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
      case "CHECKBOX":
        return this.renderCheckboxForSection(field);
      case "RADIO":
        return this.renderRadioForSection(field);
      default:
        return `<input type="text" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
    }
  }

  /**
   * Renders checkbox field (for popup widget)
   */
  private renderCheckbox(field: FormField): string {
    const options = field.options as Record<string, string> | null;
    if (!options) {
      return `<input type="checkbox" name="${field.key}" ${field.required ? "required" : ""} />`;
    }

    return Object.entries(options)
      .map(
        ([value, label]) => `
      <label style="display: flex; align-items: center; margin-bottom: 8px;">
        <input type="checkbox" name="${field.key}" value="${value}" style="width: auto; margin-right: 8px;" />
        ${label}
      </label>
    `
      )
      .join("");
  }

  /**
   * Renders checkbox field (for full-width section)
   */
  private renderCheckboxForSection(field: FormField): string {
    const options = field.options as Record<string, string> | null;
    if (!options) {
      return `<input type="checkbox" name="${field.key}" ${field.required ? "required" : ""} />`;
    }

    return `<div class="meform-checkbox-group">
      ${Object.entries(options)
        .map(
          ([value, label]) => `
        <div class="meform-checkbox-item">
          <input type="checkbox" name="${field.key}" value="${value}" />
          <label>${label}</label>
        </div>
      `
        )
        .join("")}
    </div>`;
  }

  /**
   * Renders radio field (for popup widget)
   */
  private renderRadio(field: FormField): string {
    const options = field.options as Record<string, string> | null;
    if (!options) {
      return `<input type="radio" name="${field.key}" value="yes" ${field.required ? "required" : ""} />`;
    }

    return Object.entries(options)
      .map(
        ([value, label]) => `
      <label style="display: flex; align-items: center; margin-bottom: 8px;">
        <input type="radio" name="${field.key}" value="${value}" style="width: auto; margin-right: 8px;" ${field.required ? "required" : ""} />
        ${label}
      </label>
    `
      )
      .join("");
  }

  /**
   * Renders radio field (for full-width section)
   */
  private renderRadioForSection(field: FormField): string {
    const options = field.options as Record<string, string> | null;
    if (!options) {
      return `<input type="radio" name="${field.key}" value="yes" ${field.required ? "required" : ""} />`;
    }

    return `<div class="meform-radio-group">
      ${Object.entries(options)
        .map(
          ([value, label]) => `
        <div class="meform-radio-item">
          <input type="radio" name="${field.key}" value="${value}" id="${field.key}-${value}" ${field.required ? "required" : ""} />
          <label for="${field.key}-${value}">${label}</label>
        </div>
      `
        )
        .join("")}
    </div>`;
  }

  /**
   * Handles form submission (for popup widget)
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.currentForm || !this.shadowRoot) {
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: Record<string, unknown> = {};

    // Collect form data
    formData.forEach((value, key) => {
      if (formData.getAll(key).length > 1) {
        // Multiple values (checkboxes)
        payload[key] = formData.getAll(key);
      } else {
        payload[key] = value;
      }
    });

    // Validate required fields
    const errors: string[] = [];
    for (const field of this.currentForm.fields) {
      if (field.required && !payload[field.key]) {
        errors.push(`${field.name} is required`);
      }
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Submit
    try {
      const submitUrl = new URL("/public/v1/submit", this.baseUrl);
      const response = await fetch(submitUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: this.applicationId,
          formId: this.currentForm.formId,
          hostname: window.location.hostname,
          path: window.location.pathname,
          payload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || "Submission failed");
      }

      alert("Thank you! Your submission has been received.");
      this.close();
    } catch (error) {
      console.error("meform: Submission error", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      alert(errorMessage);
    }
  }

  /**
   * Handles form submission (for full-width section)
   */
  private async handleSectionSubmit(e: Event, form: Form): Promise<void> {
    e.preventDefault();

    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    const payload: Record<string, unknown> = {};

    // Collect form data
    formData.forEach((value, key) => {
      if (formData.getAll(key).length > 1) {
        // Multiple values (checkboxes)
        payload[key] = formData.getAll(key);
      } else {
        payload[key] = value;
      }
    });

    // Validate required fields
    const errors: string[] = [];
    for (const field of form.fields) {
      if (field.required && !payload[field.key]) {
        errors.push(`${field.name} is required`);
      }
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Submit
    try {
      const submitUrl = new URL("/public/v1/submit", this.baseUrl);
      const response = await fetch(submitUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: this.applicationId,
          formId: form.formId,
          hostname: window.location.hostname,
          path: window.location.pathname,
          payload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || "Submission failed");
      }

      alert("Thank you! Your submission has been received.");
      // Reset form
      formElement.reset();
    } catch (error) {
      console.error("meform: Submission error", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      alert(errorMessage);
    }
  }

  /**
   * Destroys the widget
   */
  destroy(): void {
    this.close();
    const button = document.getElementById("meform-button");
    if (button) {
      button.remove();
    }
  }
}

// Initialize on load
(function () {
  const script = document.currentScript as HTMLScriptElement;
  const applicationId = script?.dataset.applicationId;

  if (!applicationId) {
    console.error("meform: application-id is required");
    return;
  }

  // Get baseUrl from data attribute, or auto-detect from script src
  let baseUrl = script?.dataset.baseUrl || "";
  if (!baseUrl && script?.src) {
    try {
      const scriptUrl = new URL(script.src);
      baseUrl = scriptUrl.origin;
    } catch (e) {
      // Fallback to window.location.origin if URL parsing fails
      baseUrl = window.location.origin;
    }
  }

  const widget = new MeformWidget(applicationId, baseUrl);
  widget.init();

  // Expose API
  (window as unknown as { meform: MeformWidget }).meform = widget;
})();

