# Products API Guide

A FastAPI application for managing and analyzing product data with visualization support.

## Setup

```bash
pip install -r requirements.txt
python app.py
```

The API will run at `http://localhost:8000`

## Endpoints

### General
- **GET** `/` - API overview and available endpoints

### Products
- **GET** `/products` - Get all products (with pagination)
  - Query params: `skip=0`, `limit=10`
  - Example: `/products?skip=0&limit=5`

- **GET** `/products/{product_id}` - Get a specific product
  - Example: `/products/1`

### Search & Filter
- **GET** `/search` - Search products by category and/or region
  - Query params: `category=Electronics`, `region=North`
  - Example: `/search?category=Electronics&region=North`

### Statistics
- **GET** `/stats` - Category statistics (price, sales, ratings)
  
- **GET** `/stats/region` - Region statistics
  
- **GET** `/summary` - Overall summary statistics

### Rankings
- **GET** `/top-products` - Get top products
  - Query params: `sort_by=rating` (or `sales`), `limit=5`
  - Example: `/top-products?sort_by=sales&limit=10`

## Example Requests

```bash
# Get all products
curl http://localhost:8000/products

# Search for electronics in North region
curl "http://localhost:8000/search?category=Electronics&region=North"

# Get category statistics
curl http://localhost:8000/stats

# Get top 10 products by sales
curl "http://localhost:8000/top-products?sort_by=sales&limit=10"

# Get overall summary
curl http://localhost:8000/summary
```

## Data Structure

Each product includes:
- `product_id`: Unique identifier
- `product_name`: Name of the product
- `category`: Category (Electronics, Appliances, Furniture, Sports)
- `price`: Price in USD
- `quantity_sold`: Units sold
- `rating`: Average rating (1-5)
- `region`: Geographic region (North, South, East, West)

## Interactive API Documentation

FastAPI automatically generates interactive API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
