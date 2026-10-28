/**
 * Dual-Mode Fast2SMS OTP Delivery Helper for Gulmarg Cloud Kitchen
 * - Active whenever FAST2SMS_API_KEY (or SMS_API_KEY) is set in .env (works in both dev & production).
 * - Supports Fast2SMS routes via FAST2SMS_ROUTE:
 *   - "otp" (default Quick OTP route)
 *   - "q"   (Quick transactional message route)
 *   - "dlt" (DLT approved route using FAST2SMS_SENDER_ID & FAST2SMS_TEMPLATE_ID)
 * - Falls back to Dev OTP toast in development if no API key is configured or if Fast2SMS returns an error.
 */

export interface SmsDeliveryResult {
  delivered: boolean;
  mode: "development" | "production";
  devOtp?: string;
  providerError?: string;
}

export async function sendOtpSms(
  phone: string,
  code: string
): Promise<SmsDeliveryResult> {
  const smsApiKey = (
    process.env.FAST2SMS_API_KEY ||
    process.env.SMS_API_KEY ||
    ""
  ).trim();
  const route = (process.env.FAST2SMS_ROUTE || "otp").trim().toLowerCase();

  // Always log in server console for observability during local testing
  console.log(
    `\n╔══════════════════════════════════════════════════════╗\n` +
      `║  🏔️  GULMARG CLOUD KITCHEN — ROYAL OTP DISPATCH      ║\n` +
      `║  📱 Phone : +91 ${phone.padEnd(36, " ")}║\n` +
      `║  🔑 OTP   : ${code.padEnd(40, " ")}║\n` +
      `╚══════════════════════════════════════════════════════╝\n`
  );

  if (smsApiKey) {
    try {
      let payload: Record<string, unknown>;

      if (route === "dlt") {
        payload = {
          route: "dlt",
          sender_id: process.env.FAST2SMS_SENDER_ID || "",
          message: process.env.FAST2SMS_TEMPLATE_ID || "",
          variables_values: code,
          numbers: phone,
          flash: 0,
        };
      } else if (route === "q") {
        payload = {
          route: "q",
          message: `Your Gulmarg Cloud Kitchen login OTP is ${code}. Valid for 5 minutes. Do not share this code.`,
          language: "english",
          numbers: phone,
          flash: 0,
        };
      } else {
        payload = {
          route: "otp",
          variables_values: code,
          numbers: phone,
          flash: "0",
        };
      }

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: smsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        return?: boolean;
        request_id?: string;
        message?: string | string[];
        status_code?: number;
      };

      if (response.ok && data.return === true) {
        console.log(
          `[Fast2SMS] OTP sent to +91 ${phone} (request_id: ${data.request_id || "ok"})`
        );
        return { delivered: true, mode: "production" };
      }

      const errorMessage = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || `Fast2SMS HTTP ${response.status}`;

      console.error(`[Fast2SMS Error]: ${errorMessage}`, data);

      if (process.env.NODE_ENV === "production") {
        return {
          delivered: false,
          mode: "production",
          providerError: errorMessage,
        };
      }

      // In local dev, surface the Fast2SMS error message while still providing devOtp fallback
      return {
        delivered: false,
        mode: "development",
        devOtp: code,
        providerError: errorMessage,
      };
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Network error calling Fast2SMS";
      console.error("[Fast2SMS Exception]:", error);
      return {
        delivered: false,
        mode: "development",
        devOtp: code,
        providerError: errMsg,
      };
    }
  }

  return {
    delivered: true,
    mode: "development",
    devOtp: code,
  };
}
