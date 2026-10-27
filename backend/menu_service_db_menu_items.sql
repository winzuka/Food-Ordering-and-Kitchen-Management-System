-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: menu_service_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` double NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,'Margherita Pizza','Classic pizza with fresh tomatoes, mozzarella, and basil',12.99,'Pizza','/images/menu/menu-1751437495621-jokdj7.jpg',1),(2,'Pepperoni Pizza','Traditional pizza with pepperoni and mozzarella cheese',16.99,'Pizza','/images/menu/menu-1751481979411-ep5tkz.jpg',1),(3,'BBQ Chicken Pizza','BBQ sauce, grilled chicken, red onions, and cilantro',18.99,'Pizza','/images/menu/menu-1751481595141-vnp3wy.jpg',1),(5,'Supreme Pizza','Pepperoni, sausage, bell peppers, onions, and mushrooms',19.99,'Pizza','/images/menu/menu-1751471387769-ems89k.jpg',1),(6,'Classic Burger','Beef patty with lettuce, tomato, onion, and pickles',15.99,'Burgers','/images/menu/menu-1751480988075-jfgvds.png',1),(7,'Chicken Burger','Grilled chicken breast with lettuce and tomato',14.99,'Burgers','/images/menu/menu-1751481041773-hclk62.png',1),(8,'Fish Burger','Crispy fish fillet with tartar sauce and lettuce',14.99,'Burgers','/images/menu/menu-1751481087432-52ner2.jpeg',1),(9,'Veggie Burger','Plant-based patty with fresh vegetables',13.99,'Burgers','/images/menu/menu-1751481249622-w3yrp8.png',1),(10,'Bacon Cheese Burger','Beef patty with bacon, cheese, and classic toppings',17.99,'Burgers','/images/menu/menu-1751481296843-0gcdou.png',1),(11,'Caesar Salad','Crisp romaine lettuce with caesar dressing and parmesan',8.5,'Salads','/images/menu/menu-1751472328281-04mdes.jpg',1),(12,'Greek Salad','Mixed greens with feta cheese, olives, and olive oil',9.5,'Salads','/images/menu/menu-1751481652983-ce1nxf.jpg',1),(13,'Garden Salad','Fresh mixed greens with vegetables and choice of dressing',7.99,'Salads','/images/menu/menu-1751472352431-p297av.jpg',1),(14,'Coca Cola','Classic cola drink',2.99,'Beverages','/images/menu/menu-1751481720173-8ozg02.jpg',1),(15,'Fresh Orange Juice','Freshly squeezed orange juice',4.5,'Beverages','/images/menu/menu-1751472372255-6mj8yr.jpg',1),(16,'Iced Tea','Refreshing iced tea',3.5,'Beverages','/images/menu/menu-1751472383863-601pzm.jpg',1),(17,'Coffee','Freshly brewed coffee',3.99,'Beverages','/images/menu/menu-1751472391706-9d2x3t.jpg',1),(18,'Chicken Wings','Spicy buffalo chicken wings',8.99,'Sides','/images/menu/menu-1751472400334-p0zjth.jpg',1),(19,'Garlic Bread','Toasted bread with garlic butter',4.99,'Sides','/images/menu/menu-1751472410952-siak7g.jpg',1),(20,'French Fries','Crispy golden french fries',4.5,'Sides','/images/menu/menu-1751472418953-foyy90.jpg',1);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-03 12:20:10
