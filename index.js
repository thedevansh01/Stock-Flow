import "dotenv/config";
import express from "express"
import mongoose from "mongoose"
import dns from "dns"
import Product from "./buildSchema.js"
import Users from "./data.js"

const app = express();
dns.setServers(["8.8.8.8", "1.1.1.1"]);
await mongoose.connect(process.env.MONGO_URI);

app.use(express.json());


// Create a Product
app.post("/products", async (req, res) => {
    try {
        const data = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: data
        });

    } 
    catch (error) {

        // Handle Mongoose Validation Errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: error.message
            });
        }

        // Handle Duplicate Key Errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Product already exists",
                error: error.keyValue
            });
        }

        // Handle Other Errors
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Create Products in Bulk
app.post("/products/bulk", async (req, res) => {
    try {
        const data = await Product.insertMany(Users);

        res.status(201).json({
            success: true,
            message: "Products uploaded successfully",
            totalProducts: data.length,
            products: data
        });

    } catch (error) {

        // Handle Validation Errors
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Product validation failed",
                error: error.message
            });
        }

        // Handle Duplicate Key Errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate product data found"
            });
        }

        // Handle Other Errors
        res.status(500).json({
            success: false,
            message: "Failed to upload products"
        });
    }
});

// Delete All Products
app.delete("/products/delete", async (req, res) => {
    try {
        const data = await Product.deleteMany({});

        res.status(200).json({
            success: true,
            message: "Products deleted successfully",
            deletedCount: data.deletedCount
        });

    } catch (error) {

        // Handle Other Errors
        res.status(500).json({
            success: false,
            message: "Failed to delete products"
        });
    }
});

/// Get All Products
app.get("/products", async (req, res) => {
    try {
        const data = await Product.find();

        res.status(200).json({
            success: true,
            totalProducts: data.length,
            products: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
});

// Get Product by Slug
app.get("/products/slug/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;

        const data = await Product.findOne({ slug: slug });

        // Handle Product Not Found
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Success Response
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product: data
        });

    }
    catch (error) {
        // Handle Other Errors
        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
});

// Update Product by Slug
app.patch("/products/slug/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;
        const { price, stock } = req.body;

        // Check if at least one field is provided
        if (price === undefined && stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Provide price or stock to update"
            });
        }

        // Prepare update data
        const updateData = {};

        if (price !== undefined) {
            updateData.price = price;
        }

        if (stock !== undefined) {
            updateData.stock = stock;
        }

        // Find and update product
        const data = await Product.findOneAndUpdate(
            { slug: slug },
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        // Handle product not found
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: data
        });

    } catch (error) {

        // Handle validation errors
        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product data",
                error: error.message
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
});

// Get Products by Brand
app.get("/products/search/brand", async (req, res) => {
    try {
        const brand = req.query.brand;

        // Check if brand is provided
        if (!brand || !brand.trim()) {
            return res.status(400).json({
                success: false,
                message: "Brand query parameter is required"
            });
        }

        // Find products by brand
        const data = await Product.find({
            brand: brand.trim()
        });

        // Success response
        res.status(200).json({
            success: true,
            totalProducts: data.length,
            products: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products by brand"
        });
    }
});


// Search Available Products
app.get("/products/search/available", async (req, res) => {
    try {
        const data = await Product.find({
            isAvailable: true
        });

        res.status(200).json({
            success: true,
            totalProducts: data.length,
            products: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch available products"
        });
    }
});


app.listen(3000,()=>{
    console.log("Server is listening at port 3000 !")
})