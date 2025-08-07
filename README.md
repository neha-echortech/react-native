🚀 Features & App Flow
This React Native application includes the following core functionalities for a simple product ordering system:

🔐 1. User Authentication
Login Screen: Secure login for existing users.

Users must log in before accessing any product-related features.

📦 2. Product Management
🛠️ Create Product
Add new products by entering:

Product Name

Description

Price

Products are stored and listed dynamically.

📋 Product List
Displays all products with:

Name

Description

Price

Each product includes Edit and Delete options.

✏️ Edit Product
Update details of an existing product from the list.

🗑️ Delete Product
Remove a product from the system.

🛒 3. Purchase Flow
🛍️ Buy Product
Users can browse the product list and select items to purchase.

Products are added to the Cart.

💳 Checkout
Displays selected products in a cart view.

Users can:

Review product details

See total cost

Remove items if needed

Finalize purchase by confirming the order.

📦 Order Summary
After checkout, a summary screen shows:

Purchased products

Quantity

Total price

Purchase time/date

📈 Order Status
Tracks the status of each placed order.

Example statuses: Pending, Processing, Shipped, Delivered

✅ Complete Flow Overview


Edit
Login
   ↓
Create Product → Product List → (Edit/Delete Products)
   ↓
Buy Product
   ↓
Checkout (Review Cart & Confirm Purchase)
   ↓
Order Summary
   ↓
Order Status