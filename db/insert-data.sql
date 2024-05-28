-- SAMPLE DATA

-- Insert into users table
INSERT INTO users (email, full_name, password_hash) VALUES
('john.doe@example.com', 'John Doe', '$2y$10$NqDVF2V4ARfiwOgycRhHb.NdhrLZH0BpZ16TsDx3U/8yA5E95RF.m'),
('jane.smith@sample.org', 'Jane Smith', '$2y$10$GPSSceIn0wmpTl3BilsyTuIirZuqhXzzsBZsABi15q70v1IJKn.CK'),
('alice.jones@demo.net', 'Alice Jones', '$2y$10$k6xI1MoGTWo9AuRrrV50aexR4Wt.B8Wr0LlBivwIdB2BKnMU.mOvO');

-- Insert into product_categories table
INSERT INTO product_categories (name, description) VALUES
('Electronics', 'Devices and gadgets such as smartphones, laptops, and tablets.'),
('Accessories', 'Accessories like headphones, chargers, and cases.');

-- Insert into products table
INSERT INTO products (category_id, name, description, price, stock) VALUES
(1, 'Laptop', 'High performance laptop suitable for gaming and professional software.', 1200.00, 15),
(1, 'Smartphone', 'Latest model with high-resolution camera and long-lasting battery.', 800.00, 30),
(2, 'Headphones', 'Noise cancelling headphones with high-quality audio output.', 150.00, 50);

-- Insert into user_addresses table
INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, country) VALUES
(1, '123 Main St', 'Apt 4B', 'New York', 'NY', '10001', 'USA'),
(2, '456 Oak Ave', NULL, 'Los Angeles', 'CA', '90001', 'USA'),
(3, '789 Pine Ln', 'Suite 12', 'Chicago', 'IL', '60601', 'USA');

-- Insert into carts table
INSERT INTO carts (user_id, status_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(3, 4);

-- Insert into cart_items table
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1);

-- Insert into orders table
INSERT INTO orders (user_id, address_id, sub_total, shipping_fee, tax, order_total, status_id, payment_method_id) VALUES
(1, 1, 1000.00, 50.00, 100.00, 1150.00, 1, 1),
(2, 2, 500.00, 25.00, 50.00, 575.00, 2, 2),
(3, 3, 750.00, 0.00, 75.00, 825.00, 3, 1);

-- Insert into order_items table
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1200.00),
(1, 2, 1, 800.00),
(2, 3, 2, 150.00);




