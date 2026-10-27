package com.foodapp.orderservice.repository;

import com.foodapp.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by user ID, ordered by date descending
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Find all orders, ordered by date descending
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findAllByOrderByOrderDateDesc();

    // Alternative method (simpler)
    List<Order> findAllByOrderByIdDesc();
}