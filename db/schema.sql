CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email CHECK (char_length(email) > 0 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_email_password_hash_id ON users (email, password_hash, id);

CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_category_name CHECK (char_length(name) > 0)
);

CREATE INDEX idx_category_name ON product_categories (name);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC CHECK (price > 0) NOT NULL,
    stock INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_product_name CHECK (char_length(name) > 0)
);

CREATE INDEX idx_product_name ON products (name);

CREATE TABLE cart_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(25) UNIQUE NOT NULL,
    CONSTRAINT chk_cart_status CHECK (char_length(status) > 0)
);

INSERT INTO cart_status (status) VALUES ('Active'), ('Recovered'), ('Ordered'), ('Expired');

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status_id INTEGER REFERENCES cart_status(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_cart FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_status FOREIGN KEY (status_id) REFERENCES cart_status(id),
    CONSTRAINT chk_user_id CHECK (user_id > 0)
);

CREATE INDEX idx_user_status ON carts (user_id, status_id);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER CHECK (quantity > 0) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items (product_id);

CREATE TABLE order_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) UNIQUE NOT NULL,
    CONSTRAINT chk_order_status CHECK (char_length(status) > 0)
);

INSERT INTO order_status (status) VALUES ('Pending'), ('Processing'), ('Shipped'), ('Delivered'), ('Cancelled');

CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    method VARCHAR(50) UNIQUE NOT NULL,
    CONSTRAINT chk_payment_method CHECK (char_length(method) > 0)
);

INSERT INTO payment_methods (method) VALUES ('Credit Card'), ('PayPal');

CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_address_line1 CHECK (char_length(address_line1) > 0),
    CONSTRAINT chk_city CHECK (char_length(city) > 0),
    CONSTRAINT chk_state CHECK (char_length(state) > 0),
    CONSTRAINT chk_postal_code CHECK (char_length(postal_code) > 0),
    CONSTRAINT chk_country CHECK (char_length(country) > 0)
);

CREATE INDEX idx_user_address_user_id ON user_addresses (user_id);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    address_id INTEGER REFERENCES user_addresses(id) ON DELETE SET NULL,
    sub_total NUMERIC CHECK (sub_total > 0) NOT NULL,
    shipping_fee NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    order_total NUMERIC CHECK (order_total > 0) NOT NULL,
    status_id INTEGER REFERENCES order_status(id) NOT NULL,
    payment_method_id INTEGER REFERENCES payment_methods(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_order_total CHECK (order_total = sub_total + shipping_fee + tax),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status_id ON orders (status_id);
CREATE INDEX idx_orders_payment_method_id ON orders (payment_method_id);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER CHECK (quantity > 0) NOT NULL,
    price NUMERIC CHECK (price > 0) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_token_user_id_expires_at ON refresh_tokens(token, user_id, expires_at);
CREATE INDEX idx_user_id ON refresh_tokens(user_id);

-- OAuth tables used for authentication

CREATE TABLE oauth_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO oauth_providers (name) VALUES ('google'), ('facebook');

CREATE TABLE users_oauth (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES oauth_providers(id) ON DELETE CASCADE,
    oauth_id VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider_id)
);

CREATE INDEX idx_users_oauth_user_provider ON users_oauth (user_id, provider_id);

-- Functions to interact with the database

CREATE OR REPLACE FUNCTION get_user_cart(cart_id_arg integer)
RETURNS TABLE(product_id integer, quantity integer, price numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT ci.product_id, ci.quantity, p.price
    FROM carts c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN products p ON ci.product_id = p.id
    WHERE c.id = cart_id_arg AND c.status_id = 1;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.create_order_from_cart(
	user_id_arg integer,
	cart_id_arg integer,
	shipping_fee_arg numeric,
	tax_arg numeric,
	payment_method_id_arg integer,
	address_id_arg integer)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    order_id INTEGER;
    sub_total NUMERIC;
	order_total NUMERIC;
	status_id INTEGER; 
BEGIN
	IF NOT EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id_arg AND c.status_id = 1) THEN
	    RAISE EXCEPTION 'Cart with ID % does not exist or has an invalid status.', cart_id_arg;
	END IF;

    -- Calculate total price from cart items
    SELECT SUM(price * quantity) INTO sub_total
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = cart_id_arg;

    -- Guard against empty carts
    IF sub_total IS NULL THEN
        RAISE EXCEPTION 'Cart is empty';
    END IF;

	order_total = sub_total + shipping_fee_arg + tax_arg;
	status_id = 1;   -- Order status, assuming status '1' is 'Pending'

    -- Insert a new order
    INSERT INTO orders (user_id, sub_total, shipping_fee, tax, order_total, status_id, payment_method_id, address_id)
    VALUES (user_id_arg, sub_total, shipping_fee_arg, tax_arg, order_total, status_id, payment_method_id_arg, address_id_arg) 
    RETURNING id INTO order_id;

    -- Transfer items from cart to order_items
    INSERT INTO order_items (order_id, product_id, quantity, price)
    SELECT order_id, product_id, quantity, price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = cart_id_arg;

    -- Set the cart as Ordered
    UPDATE carts SET status_id = 3 WHERE id = cart_id_arg;

    -- Return the newly created order ID
    RETURN order_id;
END;
$BODY$;


CREATE OR REPLACE FUNCTION add_item_to_cart(cart_id_arg integer, product_id_arg integer, quantity_arg integer)
RETURNS TABLE(cart_item_id integer, cart_id integer, product_id integer, quantity integer) AS $$
BEGIN
    -- Ensure both cart and product exist
    IF NOT EXISTS (SELECT 1 FROM carts WHERE id = cart_id_arg) THEN
        RAISE EXCEPTION 'Cart with ID % does not exist.', cart_id_arg;
    ELSIF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id_arg) THEN
        RAISE EXCEPTION 'Product with ID % does not exist.', product_id_arg;
    ELSE
        -- Check if the product already exists in the cart
        IF EXISTS (SELECT 1 FROM cart_items ci WHERE ci.cart_id = cart_id_arg AND ci.product_id = product_id_arg) THEN
            -- Update the existing product quantity
            UPDATE cart_items ci SET quantity = ci.quantity + quantity_arg
            WHERE ci.cart_id = cart_id_arg AND ci.product_id = product_id_arg;
        ELSE
            -- Insert a new cart item if the product does not exist in the cart
            INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES (cart_id_arg, product_id_arg, quantity_arg);
        END IF;

        -- Return the new or updated cart item
        RETURN QUERY SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity
        FROM cart_items ci WHERE ci.cart_id = cart_id_arg AND ci.product_id = product_id_arg;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamp on row update

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON product_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_oauth_updated_at
BEFORE UPDATE ON users_oauth
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
