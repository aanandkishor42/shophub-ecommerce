package com.shophub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full-stack integration test - boots the real Spring context (H2 in-memory)
 * and exercises the public API end-to-end exactly like the React frontend does.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ShopHubIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void registerAndLogin() throws Exception {
        // Register a fresh test user (idempotent - DB is shared across tests)
        String registerBody = """
                {"username":"it_user","email":"it_user@test.com","password":"secret123","firstName":"IT","lastName":"User"}
                """;
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody));

        // Login to get a token
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"it_user\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        JsonNode body = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        token = "Bearer " + body.get("token").asText();
    }

    @Test
    void products_areListedWithPaginationAndSearch() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(16))
                .andExpect(jsonPath("$.content").isArray());

        mockMvc.perform(get("/api/products").param("search", "headphone"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        mockMvc.perform(get("/api/products").param("category", "Electronics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(4));
    }

    @Test
    void productDetail_returns404_forMissingProduct() throws Exception {
        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void auth_rejectsDuplicateRegistration() throws Exception {
        String dup = """
                {"username":"it_user","email":"another@test.com","password":"secret123","firstName":"X","lastName":"Y"}
                """;
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dup))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Username already taken"));
    }

    @Test
    void auth_rejectsInvalidLogin_with401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"it_user\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void validation_rejectsShortPassword_andZeroQuantity() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"bad1","email":"bad@test.com","password":"123","firstName":"A","lastName":"B"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.password").value("Password must be at least 6 characters"));

        mockMvc.perform(post("/api/cart")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":1,\"quantity\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void cart_cartOrderAndOrderHistory_fullFlow() throws Exception {
        // Add product 1 x 2 to cart
        mockMvc.perform(post("/api/cart")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":1,\"quantity\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(2));

        // Add again -> should merge quantity
        mockMvc.perform(post("/api/cart")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":1,\"quantity\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(3));

        // Protected endpoint without token -> 401
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());

        // Read cart
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productName").value("Wireless Noise-Cancelling Headphones"));

        // Update quantity
        mockMvc.perform(put("/api/cart/1")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(4));

        // Place order
        MvcResult orderResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shippingAddress\":\"221B Baker Street, London, UK\",\"paymentMethod\":\"COD\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLACED"))
                .andExpect(jsonPath("$.items[0].quantity").value(4))
                .andReturn();

        // Order total should be product1.price * 4
        JsonNode order = objectMapper.readTree(orderResult.getResponse().getContentAsString());
        double orderTotal = order.get("totalAmount").asDouble();

        JsonNode product = objectMapper.readTree(
                mockMvc.perform(get("/api/products/1"))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString());
        assertThat(orderTotal).isEqualTo(product.get("price").asDouble() * 4);

        // Cart cleared after order
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        // Order history contains the order
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PLACED"));
    }

    @Test
    void order_failsWhenCartIsEmpty() throws Exception {
        // Make sure the shared test user's cart is clean regardless of test order
        mockMvc.perform(delete("/api/cart")
                        .header("Authorization", token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shippingAddress\":\"221B Baker Street, London, UK\",\"paymentMethod\":\"COD\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cart is empty"));
    }

    @Test
    void adminLogin_withStoredCredentials() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("roles"))
                .satisfies(roles -> assertThat(roles.toString()).contains("ROLE_ADMIN"));
    }
}