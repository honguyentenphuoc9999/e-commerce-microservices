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
  category?: Category;
}

export const catalogService = {
  // Lấy toàn bộ danh mục sản phẩm (Công khai)
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/catalog/categories'); // Dùng public path thay vì admin-bff
    return res.data;
  },

  // Lấy danh sách sản phẩm (hỗ trợ tìm kiếm theo tên hoặc danh mục)
  getProducts: async (filters?: { category?: string, name?: string }): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.name) params.append('name', filters.name);
    
    // Nếu không có param name/category, axios sẽ loại bỏ dấu ? tự động
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/catalog/products${queryString}`); // Postman 12, 14, 15
    return res.data;
  },

  // Lấy chi tiết 1 sản phẩm
  getProductById: async (id: string | number): Promise<Product> => {
    const res = await apiClient.get(`/catalog/products/${id}`); // Postman 13
    return res.data;
  },

  // --- ADMIN METHODS ---
  adminGetProducts: async (): Promise<Product[]> => {
    const res = await apiClient.get('/admin-bff/products');
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
