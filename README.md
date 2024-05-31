# E-commerce API Documentation

## Overview
This API serves as the backend for an e-commerce platform, handling user authentication, product management, cart operations, and order processing. It provides endpoints for managing users, products, carts, and orders.

## Features

### User Management
- **User Registration**: Allows new users to register by providing email, password, and full name. It returns user details along with a success message.
- **User Login**: Authenticates users and provides cookies with access and refresh tokens.
- **User Details Retrieval**: Fetch user details using a unique user ID.
- **User Update**: Allows updating user's email and full name.
- **User Deletion**: Deletes a user's account based on their unique user ID.
- **User Logout**: Logs out users by clearing their authentication tokens, ensuring secure session termination.

### User Addresses
- **List All Addresses for a User**: Retrieves all addresses associated with a specific user.
- **Create New Address**: Allows adding a new address for a user.
- **Retrieve Address Details**: Fetches detailed information of an address using its unique address ID.
- **Update Address**: Updates existing address details.
- **Delete Address**: Removes an address from the database using its unique ID.

### Product Categories
- **List All Categories**: Retrieves all categories available in the database.
- **Create New Category**: Allows adding a new product category.
- **Retrieve Category Details**: Fetches detailed information of a category using its unique category ID.
- **Update Category**: Updates existing category details.
- **Delete Category**: Removes a category from the database using its unique ID.

### Product Management
- **List All Products**: Retrieves details of all products available in the database.
- **Create New Product**: Allows adding a new product with details like name, description, price, and stock quantity.
- **Retrieve Product Details**: Fetches detailed information of a product using its unique product ID.
- **Update Product**: Updates existing product details.
- **Delete Product**: Removes a product from the database using its unique ID.

### Cart Operations
- **Retrieve Cart**: Gets all items in a user’s cart.
- **Add to Cart**: Adds a new product to the cart along with desired quantity.
- **Update Cart Item**: Modifies the quantity of an existing cart item.
- **Remove Cart Item**: Deletes an item from the cart.
- **Clear Cart**: Empties all items from a user’s cart.

### Order Processing
- **Create Order**: Converts all items in a user's cart into an order. It requires details like shipping fee, tax, and payment method ID.
- **List User Orders**: Retrieves all orders associated with a user.
- **Get Order Details**: Provides detailed information about a specific order using the order ID.
- **Update Order Status**: Allows updating the status of an order, which can include actions like processing, shipped, delivered, etc.
- **Cancel Order**: Deletes an order from the database, effectively cancelling it.

### Authentication and Security
- **Stateless Session Management**: Utilizes JSON Web Tokens (JWT) and secure cookies
- **Ouath Integrations**: Google and Facebook Ouath are included for users authentication
- **Secure Routes**: Utilizes JWT for securing routes and ensures that some actions can only be performed by authenticated users.
- **Password Hashing**: Ensures all user passwords are hashed (including salt) before storing in the database for added security.
- **Refresh Tokens**: Implements a refresh token mechanism to maintain user sessions securely.
- **Signed Cookies**: Signed Cookies are used for storing tokens and configured with security options.

### Error Handling
- **Comprehensive Error Responses**: The API provides detailed error messages and appropriate HTTP status codes to help diagnose issues during requests.

### Development and Testing
- **Local Development Support**: Includes configurations for running the API in a development environment with live reload capabilities.
- **Scalable Architecture**: Designed to be scalable and maintainable, supporting further development and integration with other services.

## Requirements
- Node.js
- Express
- PostgreSQL
- npm (Node Package Manager)
- Set up environment variables:
  - `DB_USER`
  - `DB_HOST`
  - `DB_NAME`
  - `DB_PASS`
  - `DB_PORT`
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `COOKIE_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALLBACK_URL`
  - `FACEBOOK_APP_ID`
  - `FACEBOOK_APP_SECRET`
  - `FACEBOOK_CALLBACK_URL`

## Installation
1. Clone the repository to your local machine.
2. Create the Postgres database -- use /db/schema.sql to create all database objects (create database manually before)
3. Set up environment variables in .env
4. Navigate to the project directory and install dependencies:

```
npm install
npm start
```

This will run the server on localhost:3000 by default.

## API Endpoints and Documentation

You can find the entire API documentation using the OpenAPI format (Swagger) in /doc/api.yaml

## Error Handling
The API uses standard HTTP status codes to indicate the success or failure of an API request. Common responses include:

200 OK: The request was successful.
400 Bad Request: The request was improperly formatted or missing required parameters.
401 Unauthorized: The request failed due to an invalid or missing authentication token.
404 Not Found: The requested resource was not found.
500 Internal Server Error: An error occurred on the server.

## Development
For local development, you can use the following command to start the server with nodemon, which will auto-reload on code changes:

```
npm run dev
```

## Contributing
Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or add new features.

## Contact
For any additional questions or feedback, please contact the repository owner or submit an issue on the GitHub repository page.