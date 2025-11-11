# Predefined Problems System Guide

## Overview

The Predefined Problems system allows you to create and manage common device problems that can be quickly selected during device registration, making the process more efficient and consistent.

## Features

### 1. Problem Management

- **Create**: Add new predefined problems with detailed information
- **Edit**: Modify existing problems
- **Delete**: Remove problems (with safety checks)
- **Categorize**: Organize problems by category (Hardware, Software, Network, etc.)
- **Severity Levels**: Set problem severity (Low, Medium, High, Critical)
- **Cost Estimation**: Include estimated repair costs
- **Duration Estimation**: Specify estimated repair time

### 2. Device Registration Integration

- **Multi-Select**: Choose multiple problems for a single device
- **Search & Filter**: Find problems quickly by name, category, or severity
- **Custom Notes**: Add additional details beyond predefined problems
- **Visual Indicators**: See problem categories and severity levels at a glance

## How to Use

### Managing Predefined Problems

1. **Access**: Go to Settings → System → Predefined Problems
2. **Add New Problem**:

   - Click "Add Problem"
   - Fill in the required fields:
     - **Name**: Clear, descriptive problem name
     - **Description**: Detailed explanation (optional)
     - **Category**: Hardware, Software, Network, Battery, Screen, or General
     - **Severity**: Low, Medium, High, or Critical
     - **Estimated Cost**: Expected repair cost (optional)
     - **Duration**: Estimated repair time in minutes (optional)
     - **Sort Order**: Display order (optional)

3. **Edit Problem**: Click the edit icon on any problem card
4. **Delete Problem**: Click the delete icon (only if not in use)

### Using in Device Registration

1. **Start Registration**: Go to Device Registration page
2. **Select Problems**:
   - Click "Select predefined problems..."
   - Use search and filters to find relevant problems
   - Check multiple problems if needed
   - Click "Done" to confirm selection
3. **Add Notes**: Optionally add custom description in "Additional Notes"
4. **Complete Registration**: The system will combine selected problems into a single description

## Problem Categories

### Hardware

- Screen issues
- Battery problems
- Power button issues
- Speaker/microphone problems
- Camera issues
- Charging port damage
- Volume/home button problems

### Software

- Device not turning on
- Slow performance
- App crashes
- Operating system issues
- Virus/malware removal
- Password reset needs
- Software update problems

### Network

- WiFi connectivity issues
- Bluetooth problems
- SIM card detection issues

### Battery

- Not charging
- Poor battery life
- Overheating

### Screen

- Cracked screen
- Touch unresponsive
- Display issues

### General

- Water damage
- Data recovery
- Backup and restore

## Severity Levels

- **Low**: Minor issues, quick fixes (e.g., app crashes)
- **Medium**: Moderate issues, standard repairs (e.g., battery replacement)
- **High**: Significant issues, complex repairs (e.g., screen replacement)
- **Critical**: Major issues, urgent attention (e.g., device not turning on, water damage)

## Database Schema

### Tables Created

1. **predefined_problems**

   - `id`: Unique identifier
   - `name`: Problem name
   - `description`: Detailed description
   - `category`: Problem category
   - `severity`: Severity level
   - `estimated_cost`: Estimated repair cost
   - `estimated_duration`: Estimated repair time (minutes)
   - `is_active`: Whether problem is active
   - `sort_order`: Display order
   - `created_at`, `updated_at`: Timestamps

2. **device_problems** (Junction table)
   - `id`: Unique identifier
   - `device_id`: Reference to device
   - `problem_id`: Reference to predefined problem
   - `custom_description`: Custom description for this instance
   - `created_at`: Timestamp

## API Endpoints

### GET /api/predefined-problems

- Returns all active predefined problems
- Ordered by sort_order, then name

### POST /api/predefined-problems

- Creates a new predefined problem
- Requires authentication and location access

### PUT /api/predefined-problems/:id

- Updates an existing predefined problem
- Requires authentication and location access

### DELETE /api/predefined-problems/:id

- Deletes a predefined problem
- Only if not in use by any devices
- Requires authentication and location access

## Migration

The system includes a migration script that:

1. Creates the necessary database tables
2. Inserts 30 common predefined problems
3. Sets up proper relationships

To run the migration:

```bash
node scripts/run-predefined-problems-migration.js
```

## Benefits

1. **Efficiency**: Quick selection instead of typing
2. **Consistency**: Standardized problem descriptions
3. **Accuracy**: Predefined cost and time estimates
4. **Organization**: Categorized problems for easy finding
5. **Flexibility**: Still allows custom descriptions
6. **Analytics**: Better tracking of common problems

## Best Practices

1. **Naming**: Use clear, descriptive names
2. **Categorization**: Choose appropriate categories
3. **Severity**: Set realistic severity levels
4. **Costs**: Keep cost estimates updated
5. **Maintenance**: Regularly review and update problems
6. **Training**: Train staff on using the system

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check database connection and permissions
2. **Problems Not Loading**: Verify API endpoints are working
3. **Can't Delete Problem**: Problem is in use by devices
4. **Search Not Working**: Check for typos in search terms

### Support

For technical issues or questions about the predefined problems system, refer to the system documentation or contact the development team.
