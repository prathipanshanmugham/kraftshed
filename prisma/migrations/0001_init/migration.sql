-- Kraftshed initial schema (matches prisma/schema.prisma)
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE "SellerStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'REJECTED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'COMPLETED');
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED');
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL, "name" TEXT NOT NULL, "phone" TEXT,
  "role" "Role" NOT NULL DEFAULT 'BUYER', "emailVerified" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Address" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "line1" TEXT NOT NULL, "line2" TEXT, "landmark" TEXT,
  "city" TEXT NOT NULL, "state" TEXT NOT NULL, "pincode" TEXT NOT NULL, "country" TEXT NOT NULL DEFAULT 'India',
  "isDefault" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Seller" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "storeName" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "tagline" TEXT, "description" TEXT, "logoUrl" TEXT, "bannerUrl" TEXT,
  "status" "SellerStatus" NOT NULL DEFAULT 'PENDING', "rejectionReason" TEXT,
  "businessType" TEXT, "legalName" TEXT, "gstin" TEXT, "pan" TEXT, "pickupAddress" TEXT, "pickupCity" TEXT, "pickupState" TEXT, "pickupPincode" TEXT,
  "bankAccountName" TEXT, "bankAccountNo" TEXT, "bankIfsc" TEXT, "upiId" TEXT,
  "commissionPercent" DECIMAL(5,2), "handlingDays" INTEGER NOT NULL DEFAULT 2,
  "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0, "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "description" TEXT, "imageUrl" TEXT,
  "parentId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY, "sellerId" TEXT NOT NULL REFERENCES "Seller"("id") ON DELETE CASCADE,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id"),
  "title" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "brand" TEXT, "description" TEXT NOT NULL, "bulletPoints" TEXT[] NOT NULL DEFAULT '{}',
  "materials" TEXT, "dimensions" TEXT, "weightGrams" INTEGER, "handmade" BOOLEAN NOT NULL DEFAULT true, "madeIn" TEXT NOT NULL DEFAULT 'India', "sku" TEXT,
  "mrp" DECIMAL(10,2) NOT NULL, "price" DECIMAL(10,2) NOT NULL, "stock" INTEGER NOT NULL DEFAULT 0, "lowStockAt" INTEGER NOT NULL DEFAULT 5,
  "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0, "freeShippingOver" DECIMAL(10,2), "codAvailable" BOOLEAN NOT NULL DEFAULT false,
  "returnable" BOOLEAN NOT NULL DEFAULT true, "returnDays" INTEGER NOT NULL DEFAULT 7,
  "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT', "rejectionReason" TEXT, "tags" TEXT[] NOT NULL DEFAULT '{}',
  "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0, "ratingCount" INTEGER NOT NULL DEFAULT 0, "salesCount" INTEGER NOT NULL DEFAULT 0, "viewCount" INTEGER NOT NULL DEFAULT 0,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Product_categoryId_status_idx" ON "Product"("categoryId", "status");
CREATE INDEX "Product_sellerId_status_idx" ON "Product"("sellerId", "status");

CREATE TABLE "ProductImage" ("id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE, "url" TEXT NOT NULL, "alt" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0);
CREATE TABLE "ProductVariant" ("id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE, "name" TEXT NOT NULL, "sku" TEXT, "price" DECIMAL(10,2) NOT NULL, "stock" INTEGER NOT NULL DEFAULT 0);
CREATE TABLE "Deal" ("id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL UNIQUE REFERENCES "Product"("id") ON DELETE CASCADE, "dealPrice" DECIMAL(10,2) NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "label" TEXT NOT NULL DEFAULT 'Limited-time offer');

CREATE TABLE "Cart" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE "CartItem" (
  "id" TEXT PRIMARY KEY, "cartId" TEXT NOT NULL REFERENCES "Cart"("id") ON DELETE CASCADE, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "variantId" TEXT REFERENCES "ProductVariant"("id") ON DELETE SET NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "savedForLater" BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_key" ON "CartItem"("cartId", "productId", "variantId");

CREATE TABLE "WishlistItem" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

CREATE TABLE "Coupon" (
  "id" TEXT PRIMARY KEY, "code" TEXT NOT NULL UNIQUE, "description" TEXT, "sellerId" TEXT REFERENCES "Seller"("id") ON DELETE CASCADE,
  "percentOff" INTEGER, "amountOff" DECIMAL(10,2), "minOrder" DECIMAL(10,2), "maxUses" INTEGER, "usedCount" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "endsAt" TIMESTAMP(3), "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY, "orderNumber" TEXT NOT NULL UNIQUE, "userId" TEXT NOT NULL REFERENCES "User"("id"), "addressId" TEXT NOT NULL REFERENCES "Address"("id"),
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT', "subtotal" DECIMAL(10,2) NOT NULL, "shippingTotal" DECIMAL(10,2) NOT NULL,
  "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0, "grandTotal" DECIMAL(10,2) NOT NULL, "couponId" TEXT REFERENCES "Coupon"("id"),
  "paymentMethod" TEXT NOT NULL DEFAULT 'razorpay', "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE, "productId" TEXT NOT NULL REFERENCES "Product"("id"),
  "variantId" TEXT REFERENCES "ProductVariant"("id"), "sellerId" TEXT NOT NULL REFERENCES "Seller"("id"),
  "title" TEXT NOT NULL, "imageUrl" TEXT, "unitPrice" DECIMAL(10,2) NOT NULL, "quantity" INTEGER NOT NULL, "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "lineTotal" DECIMAL(10,2) NOT NULL, "commission" DECIMAL(10,2) NOT NULL DEFAULT 0, "sellerEarning" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING', "courier" TEXT, "trackingNo" TEXT, "trackingUrl" TEXT, "shippedAt" TIMESTAMP(3), "deliveredAt" TIMESTAMP(3), "cancelReason" TEXT
);
CREATE INDEX "OrderItem_sellerId_status_idx" ON "OrderItem"("sellerId", "status");

CREATE TABLE "ReturnRequest" (
  "id" TEXT PRIMARY KEY, "orderItemId" TEXT NOT NULL UNIQUE REFERENCES "OrderItem"("id") ON DELETE CASCADE, "reason" TEXT NOT NULL, "details" TEXT,
  "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED', "sellerNote" TEXT, "refundAmount" DECIMAL(10,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL UNIQUE REFERENCES "Order"("id") ON DELETE CASCADE, "provider" TEXT NOT NULL DEFAULT 'razorpay',
  "razorpayOrderId" TEXT UNIQUE, "razorpayPaymentId" TEXT, "razorpaySignature" TEXT, "amount" DECIMAL(10,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED', "method" TEXT, "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Review" (
  "id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "orderItemId" TEXT UNIQUE REFERENCES "OrderItem"("id"), "rating" INTEGER NOT NULL, "title" TEXT, "body" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false, "helpfulCount" INTEGER NOT NULL DEFAULT 0, "sellerReply" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Review_productId_userId_key" ON "Review"("productId", "userId");

CREATE TABLE "ProductQuestion" (
  "id" TEXT PRIMARY KEY, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "question" TEXT NOT NULL, "answer" TEXT, "answeredAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "LedgerEntry" ("id" TEXT PRIMARY KEY, "sellerId" TEXT NOT NULL REFERENCES "Seller"("id") ON DELETE CASCADE, "type" TEXT NOT NULL, "amount" DECIMAL(10,2) NOT NULL, "reference" TEXT, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "LedgerEntry_sellerId_createdAt_idx" ON "LedgerEntry"("sellerId", "createdAt");

CREATE TABLE "Payout" (
  "id" TEXT PRIMARY KEY, "sellerId" TEXT NOT NULL REFERENCES "Seller"("id") ON DELETE CASCADE, "amount" DECIMAL(10,2) NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING', "periodFrom" TIMESTAMP(3) NOT NULL, "periodTo" TIMESTAMP(3) NOT NULL, "utr" TEXT, "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "paidAt" TIMESTAMP(3)
);

CREATE TABLE "Dispute" (
  "id" TEXT PRIMARY KEY, "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE, "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "subject" TEXT NOT NULL, "details" TEXT NOT NULL, "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN', "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "AdCampaign" (
  "id" TEXT PRIMARY KEY, "sellerId" TEXT NOT NULL REFERENCES "Seller"("id") ON DELETE CASCADE, "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL, "dailyBudget" DECIMAL(10,2) NOT NULL, "bidPerClick" DECIMAL(10,2) NOT NULL, "keywords" TEXT[] NOT NULL DEFAULT '{}', "isActive" BOOLEAN NOT NULL DEFAULT true,
  "impressions" INTEGER NOT NULL DEFAULT 0, "clicks" INTEGER NOT NULL DEFAULT 0, "spend" DECIMAL(10,2) NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Notification" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "link" TEXT, "isRead" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Setting" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL);
CREATE TABLE "Banner" ("id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "subtitle" TEXT, "imageUrl" TEXT, "linkUrl" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true);
