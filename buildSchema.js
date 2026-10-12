import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    brand: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["electronics", "fashion", "grocery", "furniture", "books"]
    },

    price: {
      type: Number,
      required: true,
      min: 1
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 90
    },

    stock: {
      type: Number,
      required: true,
      min: 0
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    tags: [String],

    reviews: [
      {
        user: {
          type: String,
          required: true,
          trim: true
        },
        comment: {
          type: String,
          required: true,
          trim: true
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;