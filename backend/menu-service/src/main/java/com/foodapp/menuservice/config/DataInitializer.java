package com.foodapp.menuservice.config;

import com.foodapp.menuservice.model.MenuItem;
import com.foodapp.menuservice.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only add sample data if database is empty
        if (menuItemRepository.count() == 0) {
            // Add sample menu items
            menuItemRepository.save(new MenuItem("Margherita Pizza", "Classic pizza with tomatoes, mozzarella, and basil", 12.99, "Pizza", "https://example.com/margherita.jpg", true));
            menuItemRepository.save(new MenuItem("Pepperoni Pizza", "Pizza with pepperoni and mozzarella cheese", 14.99, "Pizza", "https://example.com/pepperoni.jpg", true));
            menuItemRepository.save(new MenuItem("Chicken Burger", "Grilled chicken burger with lettuce and tomato", 9.99, "Burgers", "https://example.com/chicken-burger.jpg", true));
            menuItemRepository.save(new MenuItem("Beef Burger", "Juicy beef burger with cheese and pickles", 11.99, "Burgers", "https://example.com/beef-burger.jpg", true));
            menuItemRepository.save(new MenuItem("Caesar Salad", "Fresh romaine lettuce with caesar dressing", 8.99, "Salads", "https://example.com/caesar-salad.jpg", true));
            menuItemRepository.save(new MenuItem("Greek Salad", "Mixed greens with feta cheese and olives", 9.99, "Salads", "https://example.com/greek-salad.jpg", true));
            menuItemRepository.save(new MenuItem("Coca Cola", "Refreshing cola drink", 2.99, "Beverages", "https://example.com/coke.jpg", true));
            menuItemRepository.save(new MenuItem("Fresh Orange Juice", "Freshly squeezed orange juice", 3.99, "Beverages", "https://example.com/orange-juice.jpg", true));

            System.out.println("Sample menu items added to database!");
        }
    }
}