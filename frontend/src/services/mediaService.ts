import { apiClient } from "@/lib/apiClient";

export const mediaService = {
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<{ url: string; public_id: string }>("/media/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }
};
