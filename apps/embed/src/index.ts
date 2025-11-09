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
  id: string;
  name: string;
  fields: FormField[];
}

interface ConfigResponse {
  forms: Form[];
}

class MeformWidget {
  private applicationId: string;
  private baseUrl: string;
  private shadowRoot: ShadowRoot | null = null;
  private container: HTMLElement | null = null;
  private isOpen = false;
  private currentForm: Form | null = null;

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
      if (config.forms.length === 0) {
        return; // No forms to show
      }

      // Use first matching form
      this.currentForm = config.forms[0];
      this.renderButton();
    } catch (error) {
      console.error("meform: Failed to load config", error);
    }
  }

  /**
   * Fetches form configuration
   */
  private async fetchConfig(hostname: string, path: string): Promise<ConfigResponse> {
    const url = new URL("/public/v1/config", this.baseUrl);
    url.searchParams.set("applicationId", this.applicationId);

    const response = await fetch(url.toString(), {
      headers: {
        "X-Hostname": hostname,
        "X-Path": path,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }

    return response.json();
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
        overflow: hidden;
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
        <h3 style="margin: 0;">${this.currentForm.name}</h3>
        <button class="close-btn" id="close-btn">×</button>
      </div>
      <div class="content">
        <form id="meform-form">
          ${this.currentForm.fields
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

    this.shadowRoot.innerHTML = formHTML;

    // Attach event listeners
    const closeBtn = this.shadowRoot.querySelector("#close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    const form = this.shadowRoot.querySelector("#meform-form") as HTMLFormElement;
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    document.body.appendChild(this.container);
  }

  /**
   * Renders field input based on type
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
      default:
        return `<input type="text" name="${field.key}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`;
    }
  }

  /**
   * Renders checkbox field
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
   * Handles form submission
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
          formId: this.currentForm.id,
          hostname: window.location.hostname,
          path: window.location.pathname,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      alert("Thank you! Your submission has been received.");
      this.close();
    } catch (error) {
      console.error("meform: Submission error", error);
      alert("An error occurred. Please try again.");
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

