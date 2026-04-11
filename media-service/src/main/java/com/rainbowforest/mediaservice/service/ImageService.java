package com.rainbowforest.mediaservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ImageService {

    @Autowired
    private Cloudinary cloudinary;

    public Map<String, Object> upload(MultipartFile file) throws IOException {
        // Upload file và tự động tối ưu hóa chất lượng (f_auto, q_auto)
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "rainbow-forest/products",
                "use_filename", true,
                "unique_filename", true
        ));
    }

    public Map<String, Object> delete(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
