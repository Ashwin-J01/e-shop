import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: '',
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      trim: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Note: Using regex search instead of text index for better compatibility
// If you want to use text search, create the index manually:
// db.products.createIndex({ name: "text", description: "text", category: "text" })

export default mongoose.model('Product', productSchema);
