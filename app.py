from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional, List
import os

app = FastAPI(title="Products API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load products data
csv_path = os.path.join(os.path.dirname(__file__), "products.csv")
df = pd.read_csv(csv_path)

@app.get("/")
def read_root():
    return {
        "message": "Products API",
        "endpoints": {
            "/products": "Get all products",
            "/products/{product_id}": "Get product by ID",
            "/products/search": "Search products by category",
            "/stats": "Get statistics by category",
            "/stats/region": "Get statistics by region",
            "/top-products": "Get top products by rating or sales"
        }
    }

@app.get("/products")
def get_products(skip: int = Query(0), limit: int = Query(10)):
    """Get all products with pagination"""
    return {
        "total": len(df),
        "products": df.iloc[skip:skip+limit].to_dict('records')
    }

@app.get("/products/{product_id}")
def get_product(product_id: int):
    """Get a specific product by ID"""
    product = df[df['product_id'] == product_id]
    if product.empty:
        return {"error": "Product not found"}
    return product.to_dict('records')[0]

@app.get("/search")
def search_products(category: Optional[str] = None, region: Optional[str] = None):
    """Search products by category and/or region"""
    filtered = df

    if category:
        filtered = filtered[filtered['category'].str.lower() == category.lower()]

    if region:
        filtered = filtered[filtered['region'].str.lower() == region.lower()]

    return {
        "count": len(filtered),
        "products": filtered.to_dict('records')
    }

@app.get("/stats")
def get_category_stats():
    """Get statistics grouped by category"""
    stats = df.groupby('category').agg({
        'price': ['mean', 'min', 'max'],
        'quantity_sold': ['sum', 'mean'],
        'rating': 'mean',
        'product_id': 'count'
    }).round(2)

    return {
        "categories": stats.to_dict('index')
    }

@app.get("/stats/region")
def get_region_stats():
    """Get statistics grouped by region"""
    stats = df.groupby('region').agg({
        'quantity_sold': 'sum',
        'price': 'mean',
        'rating': 'mean',
        'product_id': 'count'
    }).round(2)

    return {
        "regions": stats.to_dict('index')
    }

@app.get("/top-products")
def get_top_products(sort_by: str = Query("rating"), limit: int = Query(5)):
    """Get top products sorted by rating or sales"""
    if sort_by == "sales":
        top = df.nlargest(limit, 'quantity_sold')
    else:
        top = df.nlargest(limit, 'rating')

    return {
        "sort_by": sort_by,
        "count": len(top),
        "products": top.to_dict('records')
    }

@app.get("/summary")
def get_summary():
    """Get summary statistics of all products"""
    return {
        "total_products": len(df),
        "total_revenue": (df['price'] * df['quantity_sold']).sum(),
        "avg_price": df['price'].mean().round(2),
        "avg_rating": df['rating'].mean().round(2),
        "total_items_sold": df['quantity_sold'].sum(),
        "categories": df['category'].nunique(),
        "regions": df['region'].nunique()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
