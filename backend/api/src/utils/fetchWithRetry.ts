// utils/fetchWithRetry.ts

export const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 2000    // increase from 1000 to 2000ms — DNS needs more recovery time
): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isNetworkError = ["ENOTFOUND", "ECONNRESET", "ETIMEDOUT"].includes(error?.code);
      const isLast = attempt === retries;

      if (isNetworkError && !isLast) {
        const waitTime = delayMs * attempt;
        console.warn(`[Retry] ${error.code} — retrying in ${waitTime}ms (attempt ${attempt}/${retries})`);
        await new Promise(res => setTimeout(res, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
};