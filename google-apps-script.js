/**
 * ============================================================================
 * SAQY FLY — Google Apps Script Backend for Website Enquiry Form
 * ============================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new blank spreadsheet, e.g., "SaqyFly Enquiries").
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any code in Code.gs and replace it with this entire script.
 * 4. Update RECIPIENT_EMAIL below to your desired Gmail address (e.g., 's.emeskn@gmail.com').
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Under "Select type" (gear icon), select "Web app".
 * 7. Configuration:
 *    - Description: "SaqyFly Enquiry Receiver"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (crucial for receiving form submissions without requiring login)
 * 8. Click "Deploy". Authorize permissions when prompted by Google.
 * 9. Copy the "Web app URL" (starts with https://script.google.com/macros/s/AKfycb.../exec).
 * 10. Open `assets/js/main.js` in your website project and set:
 *     const GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_COPIED_URL_HERE';
 * ============================================================================
 */

// Configure your notification recipient email address
var RECIPIENT_EMAIL = "s.emeskn@gmail.com";

/**
 * Handle HTTP POST requests from the website form
 */
function doPost(e) {
  try {
    // 1. Validate incoming data exists
    if (!e || !e.parameter) {
      return buildJsonResponse({ status: "error", message: "No data payload received" });
    }

    var params = e.parameter;

    // 2. Extract and sanitize fields
    var enquiryType = sanitize(params.enquiry_type || "General Enquiry");
    var name        = sanitize(params.name || "Anonymous");
    var email       = sanitize(params.email || "");
    var org         = sanitize(params.organisation || "Not specified");
    var location    = sanitize(params.location || "Not specified");
    var service     = sanitize(params.service_requested || "Not specified");
    var message     = sanitize(params.message || "No message body provided");
    var dateStr     = new Date().toLocaleString("en-GB", { timeZone: "Asia/Brunei" });

    // Validate email presence
    if (!email || email.indexOf("@") === -1) {
      return buildJsonResponse({ status: "error", message: "Valid email address is required" });
    }

    // 3. Optional: Log enquiry into active Google Sheet tab for safekeeping
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      if (sheet.getLastRow() === 0) {
        // Create headers if new sheet
        sheet.appendRow([
          "Timestamp (Brunei)",
          "Enquiry Type",
          "Customer Name",
          "Email",
          "Organisation / Farm",
          "Location / District",
          "Service Requested",
          "Message"
        ]);
        sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
      }
      sheet.appendRow([dateStr, enquiryType, name, email, org, location, service, message]);
    } catch (sheetErr) {
      Logger.log("Sheet logging skipped or failed: " + sheetErr.toString());
    }

    // 4. Construct professional email content
    var subject = "🌾 New SaqyFly Website Enquiry: " + enquiryType + " from " + name;

    var bodyHtml = 
      "<div style='font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background: #ffffff;'>" +
        "<div style='border-bottom: 2px solid #0077b6; padding-bottom: 12px; margin-bottom: 20px;'>" +
          "<h2 style='color: #0077b6; margin: 0;'>Saqy Fly — Website Form Enquiry</h2>" +
          "<p style='margin: 4px 0 0 0; font-size: 13px; color: #64748b;'>Received on " + dateStr + " (Brunei Time)</p>" +
        "</div>" +

        "<table style='width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;'>" +
          "<tr><td style='padding: 8px 0; font-weight: bold; width: 160px; color: #475569;'>Enquiry Type:</td><td style='padding: 8px 0;'>" + enquiryType + "</td></tr>" +
          "<tr><td style='padding: 8px 0; font-weight: bold; color: #475569;'>Full Name:</td><td style='padding: 8px 0;'>" + name + "</td></tr>" +
          "<tr><td style='padding: 8px 0; font-weight: bold; color: #475569;'>Email:</td><td style='padding: 8px 0;'><a href='mailto:" + email + "'>" + email + "</a></td></tr>" +
          "<tr><td style='padding: 8px 0; font-weight: bold; color: #475569;'>Organisation / Farm:</td><td style='padding: 8px 0;'>" + org + "</td></tr>" +
          "<tr><td style='padding: 8px 0; font-weight: bold; color: #475569;'>Location:</td><td style='padding: 8px 0;'>" + location + "</td></tr>" +
          "<tr><td style='padding: 8px 0; font-weight: bold; color: #475569;'>Service Requested:</td><td style='padding: 8px 0;'>" + service + "</td></tr>" +
        "</table>" +

        "<div style='background: #f8fafc; border-left: 4px solid #0077b6; padding: 14px; border-radius: 4px; margin-bottom: 20px;'>" +
          "<strong style='display: block; margin-bottom: 6px; color: #0f172a;'>Message / Field Details:</strong>" +
          "<p style='margin: 0; white-space: pre-wrap; font-size: 14px; color: #334155;'>" + message + "</p>" +
        "</div>" +

        "<div style='font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;'>" +
          "You can reply directly to this email to respond to " + name + " (" + email + ")." +
        "</div>" +
      "</div>";

    var plainBody = 
      "New SaqyFly Website Enquiry\n" +
      "---------------------------\n" +
      "Date: " + dateStr + "\n" +
      "Enquiry Type: " + enquiryType + "\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Organisation: " + org + "\n" +
      "Location: " + location + "\n" +
      "Service Requested: " + service + "\n\n" +
      "Message:\n" + message + "\n\n" +
      "---------------------------\n" +
      "Sent via SaqyFly Google Apps Script webhook.";

    // 5. Send Email via GmailApp
    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: subject,
      body: plainBody,
      htmlBody: bodyHtml
    });

    return buildJsonResponse({ status: "success", message: "Enquiry delivered successfully" });

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return buildJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Handle GET requests (useful for quick verification in browser)
 */
function doGet(e) {
  return buildJsonResponse({
    status: "active",
    message: "SaqyFly Google Apps Script webhook is online and ready to receive form POST requests."
  });
}

/**
 * Helper to build sanitized JSON response
 */
function buildJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Basic HTML sanitizer
 */
function sanitize(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
