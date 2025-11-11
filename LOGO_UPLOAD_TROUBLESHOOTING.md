# Logo Upload Troubleshooting Guide

## Issue: Second Logo Replaces First Logo

### Problem Description

When uploading a second logo, it replaces the first one instead of storing them separately.

### Root Cause

Both logo types were using the same storage key in the database, causing the second upload to overwrite the first.

### Solution Applied

✅ **Fixed**: Each logo type now uses a unique storage key:

- **Website Logo**: `"website-logo"` key
- **Business Logo**: `"business-logo"` key
- **Legacy Logo**: `"legacy-logo"` key (for backward compatibility)

### Testing Steps

#### 1. Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

#### 2. Test Logo Uploads

1. Go to **Settings** → **Business Information**
2. Upload a **Website Logo** first
3. Upload a **Business Logo** second
4. Both should now be stored separately

#### 3. Verify in Browser Console

Open browser developer tools and check the Network tab:

- Website logo upload: `/api/logo/website/upload`
- Business logo upload: `/api/logo/business/upload`
- Both should return success messages

#### 4. Check Server Logs

The server will now log:

```
📤 Uploading website logo: your-file.png
✅ Website logo saved with key: website-logo
📤 Uploading business logo: your-file.png
✅ Business logo saved with key: business-logo
```

#### 5. Test Logo Display

- **Website Logo**: Should appear on public landing page, login screen, sidebar
- **Business Logo**: Should appear on receipts, reports, business documents

### If Issues Persist

#### Clear Existing Logos

1. Go to Business Settings
2. Click "Remove" for both logo types
3. Upload them again in the correct order

#### Check Database (Advanced)

If you have database access, verify the settings:

```sql
SELECT * FROM system_settings WHERE key LIKE '%logo%';
```

You should see separate entries for:

- `website-logo`
- `business-logo`
- `legacy-logo` (if any)

### Expected Behavior After Fix

✅ **Website Logo Upload**:

- Saves to `"website-logo"` key
- Appears on public pages and UI
- Shows blue gradient fallback if not uploaded

✅ **Business Logo Upload**:

- Saves to `"business-logo"` key
- Appears on receipts and reports
- Shows generic icon fallback if not uploaded

✅ **Both Logos Coexist**:

- Each logo type stored separately
- No overwriting between types
- Both can be uploaded and displayed simultaneously

### Support

If you continue to experience issues:

1. Check server console for error messages
2. Verify both logo types are being uploaded to different endpoints
3. Clear browser cache and try again
4. Restart the server to ensure changes are applied
