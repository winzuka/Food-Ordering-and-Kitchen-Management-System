package com.foodapp.menuservice.service;

import com.foodapp.menuservice.model.MenuItem;
import com.foodapp.menuservice.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    // Get all menu items
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getAvailableMenuItems() {
        System.out.println("Fetching all menu items...");
        List<MenuItem> allItems = menuItemRepository.findAll();
        System.out.println("Found " + allItems.size() + " total items");

        List<MenuItem> availableItems = menuItemRepository.findByAvailable(true);
        System.out.println("Found " + availableItems.size() + " available items");

        // Return all items for now to test
        return allItems;
    }

    // Get menu item by ID
    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    // Get menu items by category
    public List<MenuItem> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategoryAndAvailable(category, true);
    }

    // Search menu items by name
    public List<MenuItem> searchMenuItems(String name) {
        return menuItemRepository.findByNameContainingIgnoreCase(name);
    }

    // Add new menu item (admin function)
    public MenuItem addMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    // Update menu item (admin function)
    public MenuItem updateMenuItem(Long id, MenuItem updatedMenuItem) {
        Optional<MenuItem> existingItem = menuItemRepository.findById(id);
        if (existingItem.isPresent()) {
            MenuItem item = existingItem.get();
            item.setName(updatedMenuItem.getName());
            item.setDescription(updatedMenuItem.getDescription());
            item.setPrice(updatedMenuItem.getPrice());
            item.setCategory(updatedMenuItem.getCategory());
            item.setImageUrl(updatedMenuItem.getImageUrl());
            item.setAvailable(updatedMenuItem.getAvailable());
            return menuItemRepository.save(item);
        }
        return null;
    }

    // Delete menu item (admin function)
    public boolean deleteMenuItem(Long id) {
        if (menuItemRepository.existsById(id)) {
            menuItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Get all categories (fixed for compatibility)
    public List<String> getAllCategories() {
        return menuItemRepository.findAll()
                .stream()
                .map(MenuItem::getCategory)
                .distinct()
                .collect(Collectors.toList()); // Changed from .toList()
    }
}