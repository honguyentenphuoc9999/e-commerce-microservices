package com.rainbowforest.productcatalogservice.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.service.ProductService;


@SpringBootTest
@AutoConfigureMockMvc
public class AdminProductControllerTest {

	private static final String PRODUCT_NAME= "test";
    private static final String PRODUCT_CATEGORY = "testCategory";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

	@Test
    void add_product_controller_should_return201_when_product_isSaved() throws Exception {
		//given
		Product product = new Product();
		product.setProductName(PRODUCT_NAME);
		Category category = new Category();
		category.setCategoryName(PRODUCT_CATEGORY);
		product.setCategory(category);
				
    	ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(product);
        
        //when      
        when(productService.addProduct(any(Product.class), any())).thenReturn(product);

        //then
        mockMvc.perform(post("/admin/products").content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.productName").value(PRODUCT_NAME))
                .andExpect(jsonPath("$.category.categoryName").value(PRODUCT_CATEGORY));

    	verify(productService, times(1)).addProduct(any(Product.class), any());
        verifyNoMoreInteractions(productService);
    }
	
	@Test
    void add_product_controller_should_return400_when_product_isNull() throws Exception {
		//given
		Product product = null;			
    	ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(product);

        //then
        mockMvc.perform(post("/admin/products").content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());	
	}
}
