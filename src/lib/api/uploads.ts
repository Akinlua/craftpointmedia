import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

export interface UploadResponse {
    success: boolean;
    data: {
        url: string;
        filename: string;
        size: number;
        mimeType: string;
    };
    message: string;
}

export const uploadsApi = {
    /**
     * Upload avatar image for a user
     * POST /upload/avatar/user/:id
     */
    async uploadUserAvatar(userId: string, file: File): Promise<UploadResponse> {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('avatar', file);

        const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.UPLOAD.AVATAR_USER.replace('{id}', userId)}`;
        console.log('Uploading user avatar to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload user avatar error:', errorText);
            throw new Error(`Failed to upload avatar: ${response.status}`);
        }

        const result = await response.json();
        console.log('User avatar uploaded:', result);

        return result;
    },

    /**
     * Upload avatar image for a contact
     * POST /upload/avatar/contact/:id
     */
    async uploadContactAvatar(contactId: string, file: File): Promise<UploadResponse> {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('avatar', file);

        const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.UPLOAD.AVATAR_CONTACT.replace('{id}', contactId)}`;
        console.log('Uploading contact avatar to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload contact avatar error:', errorText);
            throw new Error(`Failed to upload avatar: ${response.status}`);
        }

        const result = await response.json();
        console.log('Contact avatar uploaded:', result);

        return result;
    },

    /**
     * Upload logo for the organization
     * POST /upload/logo
     * Only Owners and Managers can upload logo
     */
    async uploadOrganizationLogo(file: File): Promise<UploadResponse> {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('file', file);

        const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.UPLOAD.LOGO}`;
        console.log('Uploading organization logo to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload logo error:', errorText);

            // Parse error for better messaging
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error?.code === 'PERMISSION_DENIED') {
                    throw new Error('Only Owners and Managers can upload organization logo');
                }
            } catch (e) {
                // If parsing fails, use generic error
            }

            throw new Error(`Failed to upload logo: ${response.status}`);
        }

        const result = await response.json();
        console.log('Organization logo uploaded:', result);

        return result;
    },
};
