/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds (will be doubled each retry)
 * @returns Promise that resolves with the function result or rejects after all retries
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 500
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't delay after the last attempt
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}

/**
 * Check if backend health endpoint is responding
 * @param apiUrl Base API URL
 * @returns Promise that resolves to true if healthy, throws error otherwise
 */
export async function checkBackendHealth(apiUrl: string): Promise<boolean> {
    const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        signal: AbortSignal.timeout(3000) // Reduced from 5s to 3s
    });

    if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
    }

    return true;
}

/**
 * Check backend health with retry logic
 * @param apiUrl Base API URL
 * @param maxRetries Maximum retry attempts (default: 3)
 * @returns Promise that resolves to true if healthy
 */
export async function checkBackendHealthWithRetry(
    apiUrl: string,
    maxRetries: number = 1  // Reduced from 3 to prevent excessive checking
): Promise<boolean> {
    return retryWithBackoff(
        () => checkBackendHealth(apiUrl),
        maxRetries,
        500 // Start with 500ms delay
    );
}
