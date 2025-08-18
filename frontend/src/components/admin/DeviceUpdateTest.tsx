import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDevices, useUpdateDevice } from "../../hooks/useDevices";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export function DeviceUpdateTest() {
  const { data: devicesData, isLoading } = useDevices(1, 5);
  const updateDeviceMutation = useUpdateDevice();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [updateName, setUpdateName] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const devices = devicesData?.data || [];

  const testDeviceUpdate = async () => {
    if (!selectedDeviceId || !updateName.trim()) {
      setTestResult("Please select a device and enter a new name");
      setIsSuccess(false);
      return;
    }

    const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
    if (!selectedDevice) {
      setTestResult("Selected device not found");
      setIsSuccess(false);
      return;
    }

    try {
      setTestResult("Testing device update...");
      setIsSuccess(false);

      console.log("🧪 Testing device update:", {
        deviceId: selectedDeviceId,
        originalName: selectedDevice.name,
        newName: updateName,
        originalDevice: selectedDevice,
      });

      // Test 1: Update with same name (should NOT cause 409)
      console.log("🧪 Test 1: Update with same name");
      await updateDeviceMutation.mutateAsync({
        id: selectedDeviceId,
        data: {
          name: selectedDevice.name,
          description: `Updated at ${new Date().toISOString()}`,
        },
      });

      console.log("✅ Test 1 passed: Same name update works");

      // Test 2: Update with new name
      console.log("🧪 Test 2: Update with new name");
      await updateDeviceMutation.mutateAsync({
        id: selectedDeviceId,
        data: {
          name: updateName,
          description: `Updated with new name at ${new Date().toISOString()}`,
        },
      });

      console.log("✅ Test 2 passed: New name update works");

      // Test 3: Update back to original name
      console.log("🧪 Test 3: Update back to original name");
      await updateDeviceMutation.mutateAsync({
        id: selectedDeviceId,
        data: {
          name: selectedDevice.name,
          description: `Restored original name at ${new Date().toISOString()}`,
        },
      });

      console.log("✅ Test 3 passed: Restore original name works");

      setTestResult(
        "All tests passed! Device update functionality is working correctly.",
      );
      setIsSuccess(true);
    } catch (error: any) {
      console.error("❌ Test failed:", error);

      let errorMessage = "Test failed: ";

      if (error?.status === 409) {
        errorMessage += `409 Conflict - ${error?.response?.error || error?.message || "Unknown conflict"}`;
        if (error?.response?.suggestion) {
          errorMessage += `\nSuggestion: ${error.response.suggestion}`;
        }
      } else if (error?.message?.includes("body stream")) {
        errorMessage += `Body stream error - ${error.message}`;
      } else {
        errorMessage += error?.message || "Unknown error";
      }

      setTestResult(errorMessage);
      setIsSuccess(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Update Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading devices...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Device Update Test</span>
          {testResult &&
            (isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="device-select">Select Device to Test</Label>
          <select
            id="device-select"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a device...</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.brand} {device.model})
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="update-name">Test Name for Update</Label>
          <Input
            id="update-name"
            value={updateName}
            onChange={(e) => setUpdateName(e.target.value)}
            placeholder="Enter a test name to update to"
          />
        </div>

        <Button
          onClick={testDeviceUpdate}
          disabled={
            !selectedDeviceId ||
            !updateName.trim() ||
            updateDeviceMutation.isPending
          }
          className="w-full"
        >
          {updateDeviceMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Testing...
            </>
          ) : (
            "Run Device Update Test"
          )}
        </Button>

        {testResult && (
          <Alert>
            <AlertDescription className="whitespace-pre-line">
              {testResult}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>This test will:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Update device with same name (should work)</li>
            <li>Update device with new name (should work)</li>
            <li>Restore original name (should work)</li>
          </ol>
          <p className="mt-2 text-xs text-gray-500">
            This helps debug 409 conflicts and response reading errors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeviceUpdateTest;
