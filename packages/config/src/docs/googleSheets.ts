/**
 * Google Sheets Integration Setup Guide
 * This guide is displayed in the UI to help users set up Google Sheets integration
 */

export const GOOGLE_SHEETS_SETUP_GUIDE = `
<h1 class="text-2xl font-bold mb-4">Google Sheets Integration Setup Guide</h1>

<h2 class="text-xl font-semibold mt-6 mb-3">Overview</h2>
<p class="mb-4">This integration allows you to automatically send form submissions to a Google Sheet using Google Apps Script.</p>

<h2 class="text-xl font-semibold mt-6 mb-3">Step 1: Create a Google Sheet</h2>
<ol class="list-decimal list-inside space-y-2 mb-4">
  <li>Create a new Google Sheet or use an existing one</li>
  <li>Note the Sheet name where you want data to be written</li>
  <li>Share the sheet with your Apps Script project (if needed)</li>
</ol>

<h2 class="text-xl font-semibold mt-6 mb-3">Step 2: Create Apps Script Project</h2>
<ol class="list-decimal list-inside space-y-2 mb-4">
  <li>In your Google Sheet, go to <strong>Extensions</strong> → <strong>Apps Script</strong></li>
  <li>Delete the default code and paste the following:</li>
</ol>

<pre class="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4"><code>function doPost(e) {
  try {
    // Parse the payload
    const data = JSON.parse(e.postData.contents);
    
    // Extract signature from body (Google Apps Script doesn't expose headers reliably)
    const signature = data.signature;
    if (!signature) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Missing signature' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Remove signature from data to get the original payload for verification
    const { signature: _, ...dataWithoutSignature } = data;
    const payload = JSON.stringify(dataWithoutSignature);
    
    // Verify HMAC signature
    const secret = 'YOUR_INTEGRATION_SECRET'; // Replace with your integration secret
    if (!verifySignature(secret, payload, signature)) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Invalid signature' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Extract form data
    const { sheetName, applicationId, formId, hostname, path, createdAt, payload: formData } = data;
    
    // Get or create the sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      // Add header row
      const headers = ['Timestamp', 'Application ID', 'Form ID', 'Hostname', 'Path', ...Object.keys(formData)];
      sheet.appendRow(headers);
    }
    
    // Append the data row
    const row = [
      createdAt,
      applicationId,
      formId,
      hostname,
      path,
      ...Object.keys(formData).map(key => formData[key])
    ];
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function verifySignature(secret, payload, signature) {
  const computed = Utilities.computeHmacSha256Signature(payload, secret);
  const computedHex = computed.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  const expected = 'sha256=' + computedHex;
  return expected === signature;
}</code></pre>

<ol class="list-decimal list-inside space-y-2 mb-4" start="3">
  <li>Replace <code class="bg-gray-100 px-1 rounded">YOUR_INTEGRATION_SECRET</code> with your actual integration secret from the application settings</li>
  <li>Save the project (give it a name like "Meform Integration")</li>
</ol>

<h2 class="text-xl font-semibold mt-6 mb-3">Step 3: Deploy as Web App</h2>
<ol class="list-decimal list-inside space-y-2 mb-4">
  <li>Click <strong>Deploy</strong> → <strong>New deployment</strong></li>
  <li>Select type: <strong>Web app</strong></li>
  <li>Set:
    <ul class="list-disc list-inside ml-6 mt-2">
      <li>Description: "Meform Integration"</li>
      <li>Execute as: <strong>Me</strong> (your account)</li>
      <li>Who has access: <strong>Anyone</strong> (or "Anyone with Google account" if you prefer)</li>
    </ul>
  </li>
  <li>Click <strong>Deploy</strong></li>
  <li>Copy the <strong>Web App URL</strong> (this is what you'll enter in the form settings)</li>
  <li>Copy the <strong>Deployment ID</strong> (optional, for tracking)</li>
</ol>

<h2 class="text-xl font-semibold mt-6 mb-3">Step 4: Configure in Meform</h2>
<ol class="list-decimal list-inside space-y-2 mb-4">
  <li>In your form settings, enable "Send submissions to Google Sheets"</li>
  <li>Enter:
    <ul class="list-disc list-inside ml-6 mt-2">
      <li><strong>Sheet Name</strong>: The name of the sheet tab where data should be written</li>
      <li><strong>Web App URL</strong>: The URL from Step 3</li>
      <li><strong>Apps Script Deployment ID</strong>: (Optional) The deployment ID from Step 3</li>
    </ul>
  </li>
  <li>Save the form</li>
</ol>

<h2 class="text-xl font-semibold mt-6 mb-3">Security Notes</h2>
<ul class="list-disc list-inside space-y-2 mb-4">
  <li>The integration uses HMAC SHA256 signatures to verify requests</li>
  <li>Keep your integration secret secure and never share it</li>
  <li>The Apps Script verifies the signature before processing any data</li>
  <li>Only requests with valid signatures will be processed</li>
</ul>

<h2 class="text-xl font-semibold mt-6 mb-3">Troubleshooting</h2>
<ul class="list-disc list-inside space-y-2 mb-4">
  <li><strong>403 Forbidden</strong>: Check that the Web App is deployed with "Anyone" access</li>
  <li><strong>Invalid signature</strong>: Verify that the integration secret matches in both places</li>
  <li><strong>Sheet not found</strong>: Ensure the sheet name matches exactly (case-sensitive)</li>
  <li><strong>No data written</strong>: Check the Apps Script execution logs in the Apps Script editor</li>
</ul>

<h2 class="text-xl font-semibold mt-6 mb-3">Testing</h2>
<p>After setup, submit a test form to verify the integration is working. Check your Google Sheet to confirm the data appears.</p>
`;

