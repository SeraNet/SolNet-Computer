# Telegram Integration for Purchase Orders

## Overview

The purchase order system now includes Telegram integration, allowing you to automatically send purchase order notifications and PDF attachments to a Telegram chat or channel.

## Features

### 1. Print Purchase Order

- **Functionality**: Generates a printer-friendly version of the purchase order
- **Format**: Clean HTML layout with professional styling
- **Usage**: Click the "Print" button in the purchase order modal
- **Output**: Opens print dialog with formatted purchase order

### 2. Download Purchase Order

- **Functionality**: Downloads purchase order as a text file
- **Format**: Structured text format with all order details
- **Usage**: Click the "Download" button in the purchase order modal
- **Output**: Text file with filename `purchase-order-{orderNumber}.txt`

### 3. Send to Telegram

- **Functionality**: Sends purchase order notification to Telegram
- **Format**: Rich message with order details and optional PDF attachment
- **Usage**: Click the "Send to Telegram" button in the purchase order modal
- **Output**: Telegram message with order summary and PDF document

## Setup Instructions

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the bot token (you'll need this later)

### 2. Get Chat ID

#### For Personal Chat:

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
3. Find the `chat_id` in the response

#### For Channel:

1. Add your bot to the channel as an admin
2. Send a message to the channel
3. Visit: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
4. Find the `chat_id` (it will be negative for channels)

### 3. Configure Environment Variables

Add these variables to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4. Restart Server

After adding the environment variables, restart your server for the changes to take effect.

## Message Format

The Telegram message includes:

```
🛒 NEW PURCHASE ORDER

📋 Order Details:
• Order Number: PO-2025-123456
• Priority: HIGH
• Total Items: 5
• Total Cost: $2,500.00
• Expected Delivery: 2025-01-15

📅 Created: 1/10/2025, 2:30:45 PM
👤 Created by: admin

📎 PDF attachment included
```

## API Endpoint

### POST `/api/telegram/send-purchase-order`

**Headers:**

- `Authorization: Bearer {jwt_token}`
- `Content-Type: multipart/form-data`

**Body:**

- `orderData`: JSON string with order information
- `pdf`: (optional) PDF file attachment

**Response:**

```json
{
  "message": "Purchase order sent to Telegram successfully",
  "success": true
}
```

## Error Handling

- If Telegram is not configured, the system will show a warning but continue normally
- If the bot token is invalid, an error will be returned
- If the chat ID is invalid, an error will be returned
- Network errors are handled gracefully with user-friendly messages

## Security

- Only authenticated users can send to Telegram
- Role-based access control (admin, technician, sales)
- Bot token is stored securely in environment variables
- All requests are validated and sanitized

## Troubleshooting

### Common Issues:

1. **"Telegram not configured"**

   - Check that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in `.env`
   - Restart the server after adding environment variables

2. **"Failed to send to Telegram"**

   - Verify the bot token is correct
   - Check that the chat ID is valid
   - Ensure the bot has permission to send messages to the chat/channel

3. **Bot not responding**
   - Make sure the bot is active and not blocked
   - Check that the bot has admin rights in the channel (if using a channel)

### Testing:

1. Send a test message to your bot manually
2. Check the bot's status with: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getMe`
3. Verify chat access with: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getChat?chat_id={YOUR_CHAT_ID}`

## Future Enhancements

- PDF generation with proper formatting
- Custom message templates
- Multiple chat/channel support
- Scheduled notifications
- Order status updates
- Delivery confirmations
