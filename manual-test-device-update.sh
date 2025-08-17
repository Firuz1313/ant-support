#!/bin/bash

# Manual test script for device updates to debug 409 conflicts
# This tests the backend API directly

API_BASE="http://localhost:3000/api/v1"

echo "🧪 Testing Device Update API directly..."
echo "=================================="

echo ""
echo "1. Getting list of devices..."
DEVICES_RESPONSE=$(curl -s -X GET "$API_BASE/devices" -H "Content-Type: application/json")
echo "Devices response: $DEVICES_RESPONSE"

# Extract first device ID (you might need to adjust this based on the response format)
DEVICE_ID=$(echo "$DEVICES_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Selected device ID: $DEVICE_ID"

if [ -z "$DEVICE_ID" ]; then
    echo "❌ No devices found. Cannot test update."
    exit 1
fi

echo ""
echo "2. Getting device details..."
DEVICE_DETAILS=$(curl -s -X GET "$API_BASE/devices/$DEVICE_ID" -H "Content-Type: application/json")
echo "Device details: $DEVICE_DETAILS"

# Extract device name
DEVICE_NAME=$(echo "$DEVICE_DETAILS" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Device name: $DEVICE_NAME"

echo ""
echo "3. Testing update with same name (should NOT cause 409)..."
UPDATE_DATA="{\"name\":\"$DEVICE_NAME\",\"description\":\"Updated at $(date)\"}"
echo "Update data: $UPDATE_DATA"

UPDATE_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$API_BASE/devices/$DEVICE_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")

HTTP_CODE="${UPDATE_RESPONSE: -3}"
RESPONSE_BODY="${UPDATE_RESPONSE%???}"

echo "HTTP Status: $HTTP_CODE"
echo "Response body: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Test passed: Same name update works"
elif [ "$HTTP_CODE" = "409" ]; then
    echo "❌ Test failed: 409 Conflict on same name update (this should not happen)"
else
    echo "❓ Unexpected response: $HTTP_CODE"
fi

echo ""
echo "4. Testing update with new name..."
NEW_NAME="${DEVICE_NAME}_test_$(date +%s)"
UPDATE_DATA_NEW="{\"name\":\"$NEW_NAME\",\"description\":\"Updated with new name at $(date)\"}"
echo "Update data: $UPDATE_DATA_NEW"

UPDATE_RESPONSE_NEW=$(curl -s -w "%{http_code}" -X PUT "$API_BASE/devices/$DEVICE_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA_NEW")

HTTP_CODE_NEW="${UPDATE_RESPONSE_NEW: -3}"
RESPONSE_BODY_NEW="${UPDATE_RESPONSE_NEW%???}"

echo "HTTP Status: $HTTP_CODE_NEW"
echo "Response body: $RESPONSE_BODY_NEW"

if [ "$HTTP_CODE_NEW" = "200" ]; then
    echo "✅ Test passed: New name update works"
elif [ "$HTTP_CODE_NEW" = "409" ]; then
    echo "❌ Test failed: 409 Conflict on new name update"
else
    echo "❓ Unexpected response: $HTTP_CODE_NEW"
fi

echo ""
echo "5. Restoring original name..."
RESTORE_DATA="{\"name\":\"$DEVICE_NAME\",\"description\":\"Restored original name at $(date)\"}"
echo "Restore data: $RESTORE_DATA"

RESTORE_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$API_BASE/devices/$DEVICE_ID" \
    -H "Content-Type: application/json" \
    -d "$RESTORE_DATA")

HTTP_CODE_RESTORE="${RESTORE_RESPONSE: -3}"
RESPONSE_BODY_RESTORE="${RESTORE_RESPONSE%???}"

echo "HTTP Status: $HTTP_CODE_RESTORE"
echo "Response body: $RESPONSE_BODY_RESTORE"

if [ "$HTTP_CODE_RESTORE" = "200" ]; then
    echo "✅ Test passed: Original name restore works"
elif [ "$HTTP_CODE_RESTORE" = "409" ]; then
    echo "❌ Test failed: 409 Conflict on original name restore"
else
    echo "❓ Unexpected response: $HTTP_CODE_RESTORE"
fi

echo ""
echo "🏁 Test completed!"
echo "=================================="
