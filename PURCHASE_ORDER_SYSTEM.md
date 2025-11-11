# Purchase Order System

## Overview

The Purchase Order System is an interactive, comprehensive inventory management feature that allows users to create and manage purchase orders for low stock and out of stock items. The system integrates seamlessly with the existing inventory management page and provides automated suggestions based on current stock levels.

## Features

### 🛒 Interactive Purchase Order Creation

- **Smart Item Selection**: Automatically fetches low stock and out of stock items
- **Flexible Filtering**: Filter items by stock status, search by name/SKU/category
- **Bulk Selection**: Select all items or individual items with checkboxes
- **Real-time Cost Calculation**: Automatically calculates estimated total cost

### 📋 Multiple Views

- **Low Stock Items**: Shows items below minimum stock levels
- **All Items**: Browse entire inventory for manual selection
- **Draft Orders**: View and manage existing draft purchase orders

### 💾 Draft Management

- **Save as Draft**: Create purchase orders and save them for later completion
- **Edit Drafts**: Continue working on saved draft orders
- **Finalize Orders**: Submit completed orders to suppliers

### 🎯 Smart Suggestions

- **Automatic Quantity Calculation**: Suggests reorder quantities based on:
  - Current stock level
  - Minimum stock level
  - Reorder quantity settings
- **Priority Assignment**: Automatically assigns priority based on stock status:
  - **Urgent**: Out of stock items
  - **High**: Low stock items
  - **Normal**: Items with adequate stock

### 📊 Order Details

- **Order Number**: Auto-generated with timestamp
- **Supplier Selection**: Choose from existing suppliers
- **Priority Levels**: Normal, High, Urgent
- **Expected Delivery Date**: Set delivery expectations
- **Notes**: Add additional information

## How to Use

### Creating a Purchase Order

1. **Access the System**

   - Navigate to the Inventory Management page
   - Click the "Purchase Order" button (orange button with shopping cart icon)

2. **Select Items**

   - Choose from "Low Stock Items" tab for automatic suggestions
   - Or use "All Items" tab for manual selection
   - Use search and filters to find specific items
   - Check items you want to include in the order

3. **Configure Order Details**

   - Review auto-generated order number
   - Select supplier (optional)
   - Set priority level
   - Add expected delivery date
   - Include any notes

4. **Review and Create**
   - Check the order summary showing:
     - Number of items selected
     - Estimated total cost
     - Number of out-of-stock items
   - Click "Create Order" to save as draft

### Managing Draft Orders

1. **View Drafts**

   - Click on "Draft Orders" tab in the purchase order modal
   - See all saved draft orders with creation date and details

2. **Edit Drafts**

   - Click "Edit" on any draft order (coming soon)
   - Modify items, quantities, or order details

3. **Finalize Orders**
   - Click "Finalize" on completed draft orders
   - This submits the order to the supplier

## Database Integration

The system uses existing database tables:

### `purchase_orders` Table

- Stores main purchase order information
- Links to location and supplier
- Tracks status (draft, submitted, approved, received, cancelled)

### `purchase_order_items` Table

- Stores individual items in each purchase order
- Includes suggested quantities and estimated prices
- Links back to inventory items

### Integration with `inventory_items`

- Fetches current stock levels
- Uses reorder points and quantities for suggestions
- Maintains supplier information

## API Endpoints

The system uses these existing API endpoints:

- `GET /api/inventory/low-stock` - Fetch low stock items
- `GET /api/inventory` - Fetch all inventory items
- `GET /api/suppliers` - Fetch available suppliers
- `GET /api/purchase-orders` - Fetch purchase orders
- `POST /api/purchase-orders` - Create new purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order status

## Technical Implementation

### Frontend Components

- `PurchaseOrderModal` - Main modal component
- Integrated into `InventoryManagement` page
- Uses React Query for data fetching
- Form validation with Zod schemas

### Key Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Automatically refreshes data
- **Error Handling**: Comprehensive error messages
- **Loading States**: Shows loading indicators during operations

### State Management

- Uses React Query for server state
- Local state for UI interactions
- Form state with React Hook Form

## Benefits

1. **Automated Workflow**: Reduces manual inventory checking
2. **Smart Suggestions**: Prevents over/under ordering
3. **Draft Management**: Allows for careful order preparation
4. **Cost Control**: Real-time cost estimation
5. **Supplier Integration**: Links orders to suppliers
6. **Audit Trail**: Complete order history and tracking

## Future Enhancements

- [ ] Email notifications for low stock
- [ ] Supplier portal integration
- [ ] Order templates for common items
- [ ] Automated reorder scheduling
- [ ] Cost analysis and reporting
- [ ] Mobile app support
- [ ] Barcode scanning integration
- [ ] Multi-location order management

## Troubleshooting

### Common Issues

1. **No items showing in low stock**

   - Check if items have minimum stock levels set
   - Verify current stock quantities

2. **Purchase order creation fails**

   - Ensure location is selected
   - Check that at least one item is selected
   - Verify supplier exists (if selected)

3. **Draft orders not appearing**
   - Check order status is set to "draft"
   - Verify user has access to the location

### Support

For technical issues or feature requests, please refer to the main project documentation or contact the development team.
