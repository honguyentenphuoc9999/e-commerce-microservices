import { apiClient } from '@/lib/apiClient';

export interface Category {
  id: number;
  categoryName: string;
  description: string;
  image?: string;
}

export interface Product {
  id: number;
  productName: string;
  price: number;
  discription: string;
  availability: number;
  image?: string;
  images?: string[];
  category?: Category;
}

export const catalogService = {
  // Lấy toàn bộ danh mục sản phẩm (Công khai)
  getCategories: async (page = 0, size = 100): Promise<any> => {
    const res = await apiClient.get('/catalog/categories', {
      params: { page, size }
    });
    return res.data;
  },

  // Lấy danh sách sản phẩm (hỗ trợ tìm kiếm theo tên, danh mục, hoặc mức giá + PHÂN TRANG)
  getProducts: async (filters?: { category?: string, name?: string, minPrice?: number, maxPrice?: number, page?: number, size?: number, sort?: string }): Promise<any> => {
    const res = await apiClient.get('/catalog/products', { 
      params: { 
        category: filters?.category || undefined,
        name: filters?.name || undefined,
        minPrice: filters?.minPrice || undefined,
        maxPrice: filters?.maxPrice || undefined,
        page: filters?.page || 0,
        size: filters?.size || 12,
        sort: filters?.sort || undefined
      } 
    });
    return res.data;
  },

  // Lấy chi tiết 1 sản phẩm
  getProductById: async (id: string | number): Promise<Product> => {
    const res = await apiClient.get(`/catalog/products/${id}`); 
    return res.data;
  },

  // --- ADMIN METHODS ---
  adminGetProducts: async (page = 0, size = 10): Promise<any> => {
    const res = await apiClient.get('/admin-bff/products', {
      params: { page, size }
    });
    return res.data;
  },

  adminAddProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.post('/admin-bff/products', product);
    return res.data;
  },

  adminUpdateProduct: async (id: number | string, product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.put(`/admin-bff/products/${id}`, product);
    return res.data;
  },

  adminDeleteProduct: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/admin-bff/products/${id}`);
  },

  adminUploadImage: async (id: number | string, file: File): Promise<Product> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post(`/admin-bff/products/upload-image/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  adminUploadImages: async (id: number | string, files: File[]): Promise<Product> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const res = await apiClient.post(`/admin-bff/uploads/gallery/${id}`, formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // --- ADMIN CATEGORY METHODS ---
  adminAddCategory: async (category: Partial<Category>): Promise<Category> => {
    const res = await apiClient.post('/admin-bff/categories', category);
    return res.data;
  },

  adminUpdateCategory: async (id: number | string, category: Partial<Category>): Promise<Category> => {
    const res = await apiClient.put(`/admin-bff/categories/${id}`, category);
    return res.data;
  },

  adminDeleteCategory: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/admin-bff/categories/${id}`);
  },

  adminUploadCategoryImage: async (id: number | string, file: File): Promise<Category> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post(`/admin-bff/categories/upload-image/${id}`, formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};
