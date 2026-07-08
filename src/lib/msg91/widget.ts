export type Msg91WidgetResponse = {
  type?: "success" | "error";
  message?: string;
  [key: string]: unknown;
};

export type Msg91WidgetConfig = {
  widgetId: string;
  tokenAuth: string;
  identifier?: string;
  exposeMethods?: boolean;
  captchaRenderId?: string;
  success?: (data: Msg91WidgetResponse) => void;
  failure?: (error: Msg91WidgetResponse) => void;
};

declare global {
  interface Window {
    initSendOTP?: (config: Msg91WidgetConfig) => void;
    sendOtp?: (
      identifier: string,
      success?: (data: Msg91WidgetResponse) => void,
      failure?: (error: Msg91WidgetResponse) => void,
    ) => void;
    retryOtp?: (
      channel: string | null,
      success?: (data: Msg91WidgetResponse) => void,
      failure?: (error: Msg91WidgetResponse) => void,
      reqId?: string,
    ) => void;
    verifyOtp?: (
      otp: string | number,
      success?: (data: Msg91WidgetResponse) => void,
      failure?: (error: Msg91WidgetResponse) => void,
      reqId?: string,
    ) => void;
    getWidgetData?: () => Record<string, unknown>;
    isCaptchaVerified?: () => boolean;
  }
}

export const MSG91_SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";

export function getMsg91Config(overrides: {
  captchaRenderId?: string;
  identifier?: string;
  success?: Msg91WidgetConfig["success"];
  failure?: Msg91WidgetConfig["failure"];
}): Msg91WidgetConfig | null {
  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
  const tokenAuth = process.env.NEXT_PUBLIC_MSG91_AUTH_TOKEN;
  if (!widgetId || !tokenAuth) return null;

  return {
    widgetId,
    tokenAuth,
    exposeMethods: true,
    identifier: overrides.identifier,
    captchaRenderId: overrides.captchaRenderId,
    success: overrides.success ?? (() => {}),
    failure: overrides.failure ?? (() => {}),
  };
}

/** Waits for otp-provider.js to define window.initSendOTP, then polls until it does. */
export function waitForMsg91(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.initSendOTP) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.initSendOTP) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error("MSG91 widget script did not load in time."));
      }
    }, 100);
  });
}
