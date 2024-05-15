INSERT INTO users (email, full_name, password_hash) VALUES
('john.doe@example.com', 'John Doe', '$2y$10$NqDVF2V4ARfiwOgycRhHb.NdhrLZH0BpZ16TsDx3U/8yA5E95RF.m'),
('jane.smith@sample.org', 'Jane Smith', '$2y$10$GPSSceIn0wmpTl3BilsyTuIirZuqhXzzsBZsABi15q70v1IJKn.CK'),
('alice.jones@demo.net', 'Alice Jones', '$2y$10$k6xI1MoGTWo9AuRrrV50aexR4Wt.B8Wr0LlBivwIdB2BKnMU.mOvO');

INSERT INTO products (name, description, price, stock) VALUES
('Laptop', 'High performance laptop suitable for gaming and professional software.', 1200.00, 15),
('Smartphone', 'Latest model with high-resolution camera and long-lasting battery.', 800.00, 30),
('Headphones', 'Noise cancelling headphones with high-quality audio output.', 150.00, 50);

INSERT INTO carts (user_id, status_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(3, 4);

INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1);

INSERT INTO orders (user_id, sub_total, shipping_fee, tax, order_total, status_id, payment_method_id) VALUES
(1, 1000.00, 50.00, 100.00, 1150.00, 1, 1),
(2, 500.00, 25.00, 50.00, 575.00, 2, 2),
(3, 750.00, 0.00, 75.00, 825.00, 3, 3);

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1200.00),
(1, 2, 1, 800.00),
(2, 3, 2, 150.00);

INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES
(1, 'token_abcdef', '2024-12-01 00:00:00'),
(2, 'token_ghijkl', '2024-12-02 00:00:00'),
(3, 'token_mnopqr', '2024-12-03 00:00:00');



