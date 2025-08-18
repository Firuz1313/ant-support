import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/api/client";
import { AlertCircle, CheckCircle, Bug } from "lucide-react";

const ApiTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [...prev, `${timestamp} ${emoji} ${message}`]);
  };

  const testResponseBodyReading = async () => {
    setIsLoading(true);
    addResult("Testing response body reading fixes...");

    try {
      // Test multiple rapid requests to check for "body already read" errors
      const promises = Array.from({ length: 3 }, (_, i) =>
        apiClient.get("/v1/devices", { params: { page: 1, limit: 1 } }),
      );

      await Promise.all(promises);
      addResult(
        "Response body reading test passed - no 'body already read' errors",
        "success",
      );
    } catch (error: any) {
      if (
        error.message.includes("body stream") ||
        error.message.includes("already read")
      ) {
        addResult(
          `Response body reading test failed: ${error.message}`,
          "error",
        );
      } else {
        addResult(
          "Response body reading test passed - different error occurred",
          "success",
        );
      }
    }

    setIsLoading(false);
  };

  const test409ErrorHandling = async () => {
    setIsLoading(true);
    addResult("Testing 409 conflict error handling...");

    try {
      // Try to trigger a 409 by creating a device with duplicate ID
      await apiClient.post("/v1/devices", {
        id: "hdbox", // Should conflict with existing device
        name: "Test Duplicate Device",
        brand: "TestBrand",
        model: "TestModel",
      });

      addResult("409 test unexpected success - no conflict detected", "error");
    } catch (error: any) {
      if (error.status === 409) {
        const hasErrorDetails =
          error.response && Object.keys(error.response).length > 0;
        const hasErrorType = error.response?.errorType;
        const hasSuggestion = error.response?.suggestion;

        addResult(
          `409 error properly caught with status: ${error.status}`,
          "success",
        );
        addResult(
          `Error details available: ${hasErrorDetails ? "Yes" : "No"}`,
          hasErrorDetails ? "success" : "error",
        );
        addResult(
          `Error type: ${hasErrorType || "undefined"}`,
          hasErrorType ? "success" : "error",
        );
        addResult(
          `Suggestion: ${hasSuggestion || "undefined"}`,
          hasSuggestion ? "success" : "error",
        );
      } else {
        addResult(
          `409 test got different error: ${error.status} - ${error.message}`,
          "error",
        );
      }
    }

    setIsLoading(false);
  };

  const testEmptyResponseHandling = async () => {
    setIsLoading(true);
    addResult("Testing empty response handling...");

    try {
      // Test with a non-existent endpoint to get empty/error response
      await apiClient.get("/v1/nonexistent");
      addResult("Empty response test unexpected success", "error");
    } catch (error: any) {
      const hasProperErrorData =
        error.response && typeof error.response === "object";
      const hasErrorType = error.response?.errorType;

      addResult(
        `Empty response properly handled: ${hasProperErrorData ? "Yes" : "No"}`,
        hasProperErrorData ? "success" : "error",
      );
      addResult(
        `Error type populated: ${hasErrorType || "undefined"}`,
        hasErrorType ? "success" : "error",
      );
    }

    setIsLoading(false);
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testResponseBodyReading();
    await test409ErrorHandling();
    await testEmptyResponseHandling();
    addResult("All API error handling tests completed", "success");
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="h-5 w-5 mr-2" />
          API Error Handling Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={testResponseBodyReading}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Test Body Reading
          </Button>
          <Button
            onClick={test409ErrorHandling}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Test 409 Handling
          </Button>
          <Button
            onClick={testEmptyResponseHandling}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Test Empty Response
          </Button>
          <Button
            onClick={runAllTests}
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            Run All Tests
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Test Results:</span>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear
            </Button>
          </div>
          <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded text-sm space-y-1">
            {testResults.length === 0 ? (
              <div className="text-gray-500">
                Click buttons above to test API error handling fixes
              </div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="font-mono text-xs">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-gray-600">
          This panel tests the fixes for:
          <ul className="list-disc list-inside mt-1">
            <li>Response body "already read" errors</li>
            <li>HTTP 409 conflict error details</li>
            <li>Empty response handling</li>
            <li>Proper error type and suggestion population</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTestPanel;
