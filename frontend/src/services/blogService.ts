import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token if needed
api.interceptors.request.use((config) => {
    // Try to get token from different possible locations in localStorage
    const authData = localStorage.getItem('auth');
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    let finalToken = '';

    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            finalToken = parsed.token || parsed.accessToken || '';
        } catch (e) {}
    }

    if (!finalToken && userData) {
        try {
            const parsed = JSON.parse(userData);
            finalToken = parsed.token || parsed.accessToken || '';
        } catch (e) {}
    }

    if (!finalToken && token) {
        finalToken = token;
    }

    if (finalToken) {
        config.headers.Authorization = `Bearer ${finalToken}`;
    }
    
    return config;
});

export interface Article {
    id?: number;
    title: string;
    summary?: string;
    content: string;
    thumbnailUrl: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Comment {
    id?: number;
    articleId: number;
    userId: string;
    username: string;
    content: string;
    parentId?: number;
    isAdmin: boolean;
    isPinned?: boolean;
    status?: 'PUBLISHED' | 'HIDDEN';
    createdAt?: string;
}

export const blogService = {
    // Public API
    getPublishedArticles: async (page = 0, size = 12) => {
        const response = await api.get<any>('/api/blog/articles', {
            params: { page, size }
        });
        return response.data;
    },
    getArticleById: async (id: number) => {
        const response = await api.get<Article>(`/api/blog/articles/${id}`);
        return response.data;
    },
    getComments: async (articleId: number) => {
        const response = await api.get<Comment[]>(`/api/blog/articles/${articleId}/comments`);
        return response.data;
    },
    getAdminComments: async (articleId: number) => {
        const response = await api.get<Comment[]>(`/api/blog/admin/articles/${articleId}/comments`);
        return response.data;
    },
    addComment: async (articleId: number, comment: Comment) => {
        const response = await api.post<Comment>(`/api/blog/articles/${articleId}/comments`, comment);
        return response.data;
    },
    // Admin API
    getAllArticles: async (page = 0, size = 10) => {
        const response = await api.get<any>('/api/blog/admin/articles', {
            params: { page, size }
        });
        return response.data;
    },
    createArticle: async (article: Article) => {
        const response = await api.post<Article>('/api/blog/admin/articles', article);
        return response.data;
    },
    updateArticle: async (id: number, article: Article) => {
        const response = await api.put<Article>(`/api/blog/admin/articles/${id}`, article);
        return response.data;
    },
    deleteArticle: async (id: number) => {
        await api.delete(`/api/blog/admin/articles/${id}`);
    },
    toggleArticleStatus: async (id: number) => {
        const response = await api.post<Article>(`/api/blog/admin/articles/${id}/toggle`);
        return response.data;
    },
    toggleCommentVisibility: async (commentId: number) => {
        const response = await api.post<Comment>(`/api/blog/admin/comments/${commentId}/toggle-visibility`);
        return response.data;
    },
    togglePinComment: async (commentId: number) => {
        const response = await api.post<Comment>(`/api/blog/admin/comments/${commentId}/pin`);
        return response.data;
    },
    deleteComment: async (id: number, userId: string) => {
        await api.delete(`/api/blog/comments/${id}`, { params: { userId } });
    }
};
