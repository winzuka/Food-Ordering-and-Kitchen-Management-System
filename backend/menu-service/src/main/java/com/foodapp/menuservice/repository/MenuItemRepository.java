package com.foodapp.menuservice.repository;

import com.foodapp.menuservice.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // Find all available menu items
    List<MenuItem> findByAvailable(Boolean available);

    // Find menu items by category
    List<MenuItem> findByCategory(String category);

    // Find available menu items by category
    List<MenuItem> findByCategoryAndAvailable(String category, Boolean available);

    // Find menu items by name containing (search functionality)
    List<MenuItem> findByNameContainingIgnoreCase(String name);
}