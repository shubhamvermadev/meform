"use client";

import { useState } from "react";
import { Card, Button } from "@meform/ui";
import { ROUTES, UI_LABELS, UI_DESCRIPTIONS } from "@meform/config";
import { useAppContext } from "@/contexts/AppContext";
import toast from "react-hot-toast";

export default function ScriptsPage() {
  const { selectedAppId } = useAppContext();
  const [copied, setCopied] = useState(false);

  const scriptTag = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}${ROUTES.CDN.EMBED}" data-application-id="${selectedAppId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    toast.success(UI_LABELS.COPIED);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedAppId) {
    return (
      <Card title={UI_LABELS.SCRIPTS}>
        <div className="text-center py-8 text-gray-500">
          Please select an application first
        </div>
      </Card>
    );
  }

  return (
    <Card title={UI_LABELS.SCRIPTS}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Add this script tag to your website to enable the meform widget.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre className="whitespace-pre-wrap">{scriptTag}</pre>
        </div>
        <Button onClick={handleCopy}>{copied ? UI_LABELS.COPIED : UI_LABELS.COPY}</Button>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <p className="text-sm text-gray-700 mb-2">{UI_DESCRIPTIONS.SCRIPT_EXPLANATION}</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>The script automatically detects the current hostname and path</li>
            <li>It matches against your URL rules to determine which form to show</li>
            <li>Forms are displayed in a floating widget on your site</li>
            <li>URL patterns support exact paths (/pricing), wildcards (/blog/*), or regex (^/docs/.*$)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
