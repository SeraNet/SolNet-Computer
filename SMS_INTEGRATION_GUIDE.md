# SMS Integration Guide

This guide explains how to set up and use the SMS notification system for device registration and status updates.

## Overview

The SMS integration allows your repair shop to automatically send SMS notifications to customers when:

- A device is registered for repair
- Device status changes (diagnosed, in progress, waiting parts, completed, ready for pickup, delivered, cancelled)

## Features

### 1. Device Registration SMS

When a customer registers a device for repair, they automatically receive an SMS with:

- Device details (type, brand, model)
- Problem description
- Tracking number
- Next steps information

### 2. Status Update SMS

Customers receive SMS notifications when their device status changes:

- **Diagnosed**: Device has been diagnosed and repair plan is prepared
- **In Progress**: Repair work has started
- **Waiting Parts**: Waiting for parts to arrive
- **Completed**: Repair is finished
- **Ready for Pickup**: Device is ready for customer pickup
- **Delivered**: Device has been delivered to customer
- **Cancelled**: Repair has been cancelled

### 3. Special Notifications

- **Ready for Pickup**: Enhanced notification with pickup instructions
- **Delivered**: Confirmation with thank you message

## Setup Instructions

### 1. SMS Provider Options

The system supports multiple SMS providers:

#### Option A: Twilio (International)

1. **Create a Twilio Account**

   - Go to [Twilio Console](https://console.twilio.com/)
   - Sign up for a free account
   - Verify your email and phone number

2. **Get Your Credentials**

   - Account SID: Found in your Twilio Console dashboard
   - Auth Token: Found in your Twilio Console dashboard
   - Phone Number: Purchase a Twilio phone number for sending SMS

3. **Configure Environment Variables**
   Add the following to your `.env` file:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_FROM_NUMBER=+1234567890
   TEST_SMS_NUMBER=+1234567890
   ```

#### Option B: Ethiopian SMS Providers (Recommended for Ethiopia)

The system supports local Ethiopian SMS providers for better coverage and Amharic language support:

1. **Ethio Telecom**

   - Contact Ethio Telecom for SMS gateway access
   - Get username, password, and API endpoint
   - Configure in Settings → Ethiopian SMS Service

2. **AfricasTalking**

   - Sign up at [AfricasTalking](https://africastalking.com/)
   - Get API key and username
   - Supports Amharic language

3. **BulkSMS**

   - Sign up at [BulkSMS](https://www.bulksms.com/)
   - Get API key
   - Good for bulk messaging

4. **Local SMS Aggregators**

   - Contact local SMS aggregators in Ethiopia
   - Get API credentials and endpoint
   - Often provide better local rates

5. **Configure Ethiopian SMS Environment Variables**
   Add the following to your `.env` file:
   ```env
   ETHIOPIAN_SMS_USERNAME=your_ethiopian_sms_username
   ETHIOPIAN_SMS_API_KEY=your_ethiopian_sms_api_key
   ETHIOPIAN_SMS_SENDER_ID=SolNet
   ETHIOPIAN_SMS_BASE_URL=https://sms.ethiotelecom.et/api/send
   ```

### 2. Application Configuration

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure SMS Settings**

   **For Twilio:**

   - Go to Settings → Notifications → SMS Configuration
   - Enter your Twilio credentials
   - Test the SMS service

   **For Ethiopian SMS Providers:**

   - Go to Settings → Ethiopian SMS Service
   - Select your provider (Ethio Telecom, AfricasTalking, BulkSMS, etc.)
   - Enter your credentials
   - Configure sender ID and base URL
   - Test the SMS service

3. **Test the Integration**
   - Use the "Test SMS" button in the settings
   - Register a test device to verify registration SMS
   - Update device status to test status update SMS

## Benefits of Ethiopian SMS Providers

### Why Use Local Ethiopian SMS Providers?

1. **Better Coverage**

   - Direct integration with Ethiopian mobile networks
   - Higher delivery rates for Ethiopian phone numbers
   - Reduced message delays

2. **Amharic Language Support**

   - Native support for Amharic characters
   - Better customer experience for Ethiopian customers
   - Proper encoding and display of Amharic text

3. **Cost Effective**

   - Lower rates for local SMS
   - No international SMS charges
   - Better pricing for bulk messaging

4. **Compliance**
   - Meets Ethiopian telecommunications regulations
   - Proper sender ID registration
   - Local business verification

### Supported Ethiopian Providers

1. **Ethio Telecom** (Recommended)

   - Official Ethiopian telecommunications provider
   - Best coverage across Ethiopia
   - Official API integration

2. **AfricasTalking**

   - Pan-African SMS provider
   - Good API documentation
   - Reliable service

3. **BulkSMS**

   - International provider with Ethiopian coverage
   - Good for bulk messaging
   - Competitive pricing

4. **Local Aggregators**
   - Local Ethiopian SMS companies
   - Often provide best local rates
   - Direct network integration

## Usage

### Automatic Notifications

Once configured, SMS notifications are sent automatically:

1. **Device Registration**

   - When a new device is registered through the device registration form
   - Customer receives confirmation SMS with tracking number

2. **Status Updates**
   - When device status is updated in the repair tracking page
   - Customer receives status-specific notification

### Manual Testing

1. **Test SMS Service**

   - Go to Settings → Notifications → SMS Configuration
   - Click "Test SMS" button
   - Verify SMS is received

2. **Test Device Registration**

   - Register a new device with a valid phone number
   - Check if registration SMS is received

3. **Test Status Updates**
   - Update device status in repair tracking
   - Verify status update SMS is received

## SMS Message Templates

### Device Registration

```
🔧 Device Registration Confirmed

Dear [Customer Name],

Your device has been successfully registered for repair service.

📱 Device Details:
• Type: [Device Type]
• Brand: [Brand]
• Model: [Model]
• Problem: [Problem Description]

🔢 Tracking Number: [Receipt Number]

We'll keep you updated on the repair progress. You can track your device status using the tracking number above.

Thank you for choosing our service!
```

### Status Update

```
📱 Device Status Update

Dear [Customer Name],

[Status-specific message]

🔢 Tracking Number: [Receipt Number]
📱 Device: [Device Type] [Brand] [Model]
💰 Total Cost: [Cost] (if available)
📅 Estimated Completion: [Date] (if available)

Thank you for your patience!
```

### Ready for Pickup

```
🎉 Device Ready for Pickup!

Dear [Customer Name],

Your device repair is complete and ready for pickup!

📱 Device: [Device Type] [Brand] [Model]
🔢 Tracking Number: [Receipt Number]
💰 Total Cost: [Cost] (if available)

Please bring your tracking number when picking up your device.

We look forward to seeing you!
```

## Configuration Options

### SMS Service Status

The system automatically detects if SMS service is properly configured:

- ✅ **Configured**: All required fields are filled
- ❌ **Not Configured**: Missing required configuration

### Phone Number Formatting

The system automatically formats phone numbers:

- 10-digit numbers: Adds +1 (US)
- 11-digit numbers starting with 1: Adds +
- Numbers already with +: Used as-is

### Error Handling

- Failed SMS sends are logged but don't break the application
- SMS service can be disabled by leaving configuration empty
- Test endpoint validates configuration before sending

## Troubleshooting

### Common Issues

1. **SMS Not Sending**

   - Check Twilio credentials in environment variables
   - Verify phone number format
   - Check Twilio account balance
   - Review server logs for error messages

2. **Invalid Phone Numbers**

   - Ensure phone numbers are in correct format
   - Check for special characters or spaces
   - Verify country code is included

3. **Twilio Errors**
   - Check Twilio Console for error details
   - Verify Account SID and Auth Token
   - Ensure phone number is verified (for trial accounts)

### Debug Mode

When SMS service is not configured, messages are logged to console:

```
📱 SMS disabled - would send to [phone]: [message]
```

### Logs

Check server logs for SMS-related messages:

- ✅ Success: "SMS sent successfully to [phone]"
- ❌ Error: "Failed to send SMS to [phone]: [error]"

## Security Considerations

1. **Environment Variables**

   - Never commit Twilio credentials to version control
   - Use environment variables for sensitive data
   - Rotate Auth Token regularly

2. **Phone Number Validation**

   - Validate phone numbers before sending
   - Implement rate limiting if needed
   - Respect customer opt-out preferences

3. **Data Privacy**
   - Only send necessary information in SMS
   - Don't include sensitive device details
   - Follow local SMS regulations

## Cost Considerations

### Twilio Pricing

- Free trial: 15 SMS credits
- Pay-as-you-go: ~$0.0075 per SMS (US)
- Volume discounts available

### Optimization Tips

- Only send essential notifications
- Consider bundling multiple updates
- Use email for detailed information

## Future Enhancements

Potential improvements for the SMS system:

1. **Customizable Templates**: Allow editing of SMS message templates
2. **Scheduling**: Send reminders at specific times
3. **Opt-out Management**: Allow customers to opt out of SMS
4. **Multi-language Support**: Support for different languages
5. **Delivery Reports**: Track SMS delivery status
6. **Bulk Notifications**: Send to multiple customers at once

## Support

For issues with the SMS integration:

1. Check this guide first
2. Review server logs for error messages
3. Test with Twilio Console directly
4. Contact support with specific error details
