# API Reference

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user"],
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer {refresh_token}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {access_token}
```

## Stores

### Create Store

```http
POST /stores
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "My Store",
  "description": "Store description",
  "categories": ["electronics", "computers"]
}
```

### Get Store

```http
GET /stores/{storeId}
Authorization: Bearer {access_token}
```

### Update Store

```http
PUT /stores/{storeId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Store Name",
  "description": "Updated description"
}
```

### Delete Store

```http
DELETE /stores/{storeId}
Authorization: Bearer {access_token}
```

### List Stores

```http
GET /stores
Authorization: Bearer {access_token}
```

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)
- `search` (optional): Search term
- `category` (optional): Filter by category

## Products

### Create Product

```http
POST /products
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "storeId": "store-uuid",
  "categories": ["electronics"],
  "images": [File]
}
```

### Get Product

```http
GET /products/{productId}
Authorization: Bearer {access_token}
```

### Update Product

```http
PUT /products/{productId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 149.99
}
```

### Delete Product

```http
DELETE /products/{productId}
Authorization: Bearer {access_token}
```

### List Products

```http
GET /products
Authorization: Bearer {access_token}
```

Query Parameters:

- `page` (optional): Page number
- `limit` (optional): Items per page
- `sort` (optional): Sort field
- `order` (optional): Sort order
- `search` (optional): Search term
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `storeId` (optional): Filter by store

## Reviews

### Create Review

```http
POST /reviews
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": "product-uuid",
  "rating": 5,
  "comment": "Great product!",
  "images": ["url1", "url2"]
}
```

### Get Review

```http
GET /reviews/{reviewId}
Authorization: Bearer {access_token}
```

### Update Review

```http
PUT /reviews/{reviewId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review

```http
DELETE /reviews/{reviewId}
Authorization: Bearer {access_token}
```

### List Reviews

```http
GET /reviews
Authorization: Bearer {access_token}
```

Query Parameters:

- `page` (optional): Page number
- `limit` (optional): Items per page
- `productId` (optional): Filter by product
- `userId` (optional): Filter by user
- `rating` (optional): Filter by rating

## Categories

### Create Category

```http
POST /categories
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic products",
  "parentId": "parent-category-uuid"
}
```

### Get Category

```http
GET /categories/{categoryId}
Authorization: Bearer {access_token}
```

### Update Category

```http
PUT /categories/{categoryId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

### Delete Category

```http
DELETE /categories/{categoryId}
Authorization: Bearer {access_token}
```

### List Categories

```http
GET /categories
Authorization: Bearer {access_token}
```

Query Parameters:

- `includeProducts` (optional): Include product counts
- `includeChildren` (optional): Include subcategories

## Admin

### List Users

```http
GET /admin/users
Authorization: Bearer {access_token}
```

### Update User Roles

```http
PUT /admin/users/{userId}/roles
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "roles": ["admin", "user"]
}
```

### Get System Stats

```http
GET /admin/stats
Authorization: Bearer {access_token}
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "must be an email"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
