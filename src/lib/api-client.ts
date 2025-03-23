import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    retries?: number;
}

/**
 * A robust API client for making authenticated requests
 */
export const apiClient = {
    async fetch(url: string, session: Session | null, options: ApiOptions = {}) {
        const {
            method = 'GET',
            body,
            headers = {},
            retries = 2, // Retry failed requests by default
        } = options;

        if (!session || !session.accessToken) {
            console.error('No valid session for API request to:', url);
            return { error: 'Not authenticated' };
        }

        // Default headers with auth token
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers,
        };

        const requestOptions = {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        };

        // Try the request with retries
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, requestOptions);

                // If unauthorized, try to handle session issues
                if (response.status === 401) {
                    console.warn('Received 401 Unauthorized from API:', url);
                    // If this is the last retry and we're still getting 401, sign out
                    if (attempt === retries) {
                        console.error('Multiple 401 errors, signing out user');
                        await signOut({ redirect: true, callbackUrl: '/auth/signin' });
                        return { error: 'Session expired' };
                    }
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }

                // Check if we got a successful response
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Request failed with status ${response.status}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`API request failed (attempt ${attempt + 1}/${retries + 1}):`, error);
                lastError = error;

                // Wait a bit longer between retries
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }

        return { error: lastError?.message || 'Request failed' };
    },

    // Helper methods for common request types
    async get(url: string, session: Session | null, options: Omit<ApiOptions, 'method' | 'body'> = {}) {
        return this.fetch(url, session, { ...options, method: 'GET' });
    },

    async post(url: string, body: any, session: Session | null, options: Omit<ApiOptions, 'method'> = {}) {
        return this.fetch(url, session, { ...options, method: 'POST', body });
    }
};
