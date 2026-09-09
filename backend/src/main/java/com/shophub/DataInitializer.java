package com.shophub;

import com.shophub.entity.Product;
import com.shophub.entity.Role;
import com.shophub.entity.User;
import com.shophub.repository.ProductRepository;
import com.shophub.repository.RoleRepository;
import com.shophub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ProductRepository productRepository, RoleRepository roleRepository,
                           UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.productRepository = productRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initAdmin();
        initProducts();
    }

    private void initRoles() {
        for (Role.RoleName name : Role.RoleName.values()) {
            if (roleRepository.findByName(name).isEmpty()) {
                roleRepository.save(new Role(name));
            }
        }
    }

    private void initAdmin() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Role missing"));
            Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Role missing"));

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@shophub.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("ShopHub");
            admin.setRoles(Set.of(adminRole, userRole));
            userRepository.save(admin);
        }
    }

    private void initProducts() {
        if (productRepository.count() > 0) return;

        product( "Wireless Noise-Cancelling Headphones", 
            "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and deep bass. "
            + "Bluetooth 5.3, built-in mic for calls, and plush memory-foam ear cushions.",
            7999, "Electronics",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", 50);

        product("Smart Fitness Watch", 
            "Track heart rate, steps, sleep, and 20+ workout modes. 1.65-inch AMOLED display, "
            + "5ATM waterproof, 10-day battery life.",
            4999, "Electronics",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", 80);

        product("Mechanical Keyboard - RGB", 
            "Hot-swappable mechanical keyboard with custom RGB backlighting, aluminum frame, "
            + "and satisfying tactile switches for typing and gaming.",
            6999, "Electronics",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", 40);

        product("Ultrabook Laptop 15\"", 
            "Lightweight ultrabook with a brilliant 15-inch display, all-day battery, "
            + "fast SSD storage, and a comfortable backlit keyboard.",
            89999, "Electronics",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", 15);

        product("Classic White Sneakers", 
            "Timeless canvas sneakers that pair with everything. Cushioned insole, "
            + "durable rubber outsole, and breathable lining.",
            2999, "Fashion",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80", 120);

        product("Leather Crossbody Bag", 
            "Genuine leather crossbody bag with adjustable strap, multiple compartments, "
            + "and a sleek minimalist design.",
            3999, "Fashion",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", 60);

        product("Aviator Sunglasses", 
            "Classic aviator sunglasses with polarized UV-protective lenses and a "
            + "lightweight metal frame. Includes protective case.",
            1499, "Fashion",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80", 90);

        product("Men's Denim Jacket", 
            "Sturdy denim jacket with a modern slim fit. Classic button front, "
            + "chest pockets, and durable stitching.",
            3499, "Fashion",
            "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80", 45);

        product("Stainless Steel Water Bottle", 
            "Double-wall insulated bottle keeps drinks cold 24h or hot 12h. "
            + "Leak-proof lid, 750ml capacity, BPA-free.",
            999, "Home & Living",
            "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80", 150);

        product("Ceramic Coffee Mug Set", 
            "Set of 4 handcrafted ceramic mugs in earthy tones. Holds 350ml, "
            + "dishwasher and microwave safe.",
            1299, "Home & Living",
            "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80", 100);

        product("Ergonomic Office Chair", 
            "Breathable mesh back, adjustable lumbar support, and padded armrests. "
            + "Supports up to 120kg with smooth rolling casters.",
            12999, "Home & Living",
            "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80", 25);

        product("Standing Desk Converter", 
            "Sit-stand desk riser with gas-lift mechanism. Two-tier workspace, "
            + "fits most desks, and supports a keyboard plus monitor.",
            8999, "Home & Living",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80", 20);

        product("Organic Green Tea (100 bags)", 
            "Single-origin organic green tea packed in a resalable bag. "
            + "Light, earthy flavor with natural antioxidants.",
            699, "Groceries",
            "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&q=80", 200);

        product("Cold Brew Coffee Maker", 
            "Large-format cold brew system makes smooth, low-acid iced coffee at home. "
            + "1.5L glass pitcher with stainless filter.",
            2499, "Groceries",
            "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80", 35);

        product("Yoga Mat - Non Slip", 
            "6mm thick TPE yoga mat with alignment lines and a non-slip texture. "
            + "Carry strap and cleaning cloth included.",
            1999, "Sports",
            "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80", 70);

        product("Adjustable Dumbbell Set", 
            "Replace an entire rack with this space-saving adjustable dumbbell set. "
            + "Quick-dial weight selection, durable steel plates.",
            15999, "Sports",
            "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", 18);
    }

    private void product(String name, String description, double price, String category,
                         String imageUrl, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setCategory(category);
        p.setImageUrl(imageUrl);
        p.setStock(stock);
        p.setInStock(stock > 0);
        productRepository.save(p);
    }
}
