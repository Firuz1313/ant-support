import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDevices } from "@/hooks/useDevices";
import { useProblems } from "@/hooks/useProblems";
import { Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";

const CRUDTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: devicesData } = useDevices(1, 10);
  const { data: problemsData } = useProblems(1, 10);
  
  const devices = devicesData?.data || [];
  const problems = problemsData?.data || [];

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDeviceOperations = async () => {
    setIsLoading(true);
    addTestResult("🧪 Тестирование CRUD операций для устройств...");

    try {
      // Тест CREATE (создание устройства)
      const createData = {
        id: `test-device-${Date.now()}`,
        name: `Тестовое устройство ${Date.now()}`,
        brand: "TestBrand",
        model: "TestModel",
        description: "Тестовое устройство для проверки CRUD операций",
        color: "from-green-500 to-green-600"
      };

      const createResponse = await fetch('/api/v1/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        addTestResult(`✅ CREATE устройство: ${created.data?.name}`);
        
        // Тест UPDATE (обновление устройства)
        const updateData = {
          description: "Обновленное описание для тестирования"
        };

        const updateResponse = await fetch(`/api/v1/devices/${created.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          addTestResult(`✅ UPDATE устройство: ${created.data.id}`);
        } else {
          const updateError = await updateResponse.json();
          addTestResult(`❌ UPDATE failed: ${updateError.error}`);
        }

        // Тест DELETE (удаление устройства)
        const deleteResponse = await fetch(`/api/v1/devices/${created.data.id}`, {
          method: 'DELETE'
        });

        if (deleteResponse.ok) {
          addTestResult(`✅ DELETE устройство: ${created.data.id}`);
        } else {
          const deleteError = await deleteResponse.json();
          addTestResult(`❌ DELETE failed: ${deleteError.error}`);
        }

      } else {
        const createError = await createResponse.json();
        addTestResult(`❌ CREATE failed: ${createError.error}`);
      }

    } catch (error) {
      addTestResult(`❌ Ошибка тестирования устройств: ${error}`);
    }

    setIsLoading(false);
  };

  const testProblemOperations = async () => {
    setIsLoading(true);
    addTestResult("🧪 Тестирование CRUD операций для проблем...");

    if (devices.length === 0) {
      addTestResult("❌ Нет устройств для создания проблем");
      setIsLoading(false);
      return;
    }

    try {
      // Тест CREATE (создание проблемы) - пробуем разные эндпоинты
      const problemData = {
        device_id: devices[0].id,
        title: `Тестовая проблема ${Date.now()}`,
        description: "Тестовая проблема для проверки CRUD операций",
        category: "moderate",
        status: "published",
        priority: 1,
        estimated_time: 5
      };

      // Пробуем основной эндпоинт
      let createResponse = await fetch('/api/v1/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemData)
      });

      if (!createResponse.ok) {
        addTestResult(`⚠️ Основной эндпоинт failed, пробуем /new`);
        
        // Пробуем новый эндпоинт
        createResponse = await fetch('/api/v1/problems/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(problemData)
        });
      }

      if (createResponse.ok) {
        const created = await createResponse.json();
        addTestResult(`✅ CREATE проблема: ${created.data?.title}`);
      } else {
        const createError = await createResponse.json();
        addTestResult(`❌ CREATE проблема failed: ${createError.error || createError.details}`);
      }

    } catch (error) {
      addTestResult(`❌ Ошибка тестирования проблем: ${error}`);
    }

    setIsLoading(false);
  };

  const testEntityRelationships = async () => {
    setIsLoading(true);
    addTestResult("🔗 Тестирование связей между сущностями...");

    try {
      // Проверяем связь устройства-проблемы
      if (devices.length > 0) {
        const deviceWithProblems = await fetch(`/api/v1/devices/${devices[0].id}?include_stats=true`);
        if (deviceWithProblems.ok) {
          const data = await deviceWithProblems.json();
          addTestResult(`✅ Устройство ${devices[0].name}: найдено ${data.data?.problems_count || 0} проблем`);
        }
      }

      // Проверяем проблемы по устройству
      if (devices.length > 0) {
        const problemsByDevice = await fetch(`/api/v1/problems?device_id=${devices[0].id}`);
        if (problemsByDevice.ok) {
          const data = await problemsByDevice.json();
          addTestResult(`✅ Проблемы для ${devices[0].name}: ${data.data?.length || 0} найдено`);
        }
      }

      // Проверяем шаги по проблемам
      if (problems.length > 0) {
        const stepsByProblem = await fetch(`/api/v1/steps?problem_id=${problems[0].id}`);
        if (stepsByProblem.ok) {
          const data = await stepsByProblem.json();
          addTestResult(`✅ Шаги для проблемы ${problems[0].title}: ${data.data?.length || 0} найдено`);
        }
      }

    } catch (error) {
      addTestResult(`❌ Ошибка тестирования связей: ${error}`);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Панель тестирования CRUD операций
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статистика текущих данных */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
            <div className="text-sm text-gray-600">Устройств</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{problems.length}</div>
            <div className="text-sm text-gray-600">Проблем</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Шагов</div>
          </div>
        </div>

        {/* Кнопки тестирования */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testDeviceOperations} 
            disabled={isLoading}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Тест Устройств
          </Button>
          <Button 
            onClick={testProblemOperations} 
            disabled={isLoading}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Тест Проблем
          </Button>
          <Button 
            onClick={testEntityRelationships} 
            disabled={isLoading}
            variant="outline"
            className="col-span-2"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Тест Связей
          </Button>
        </div>

        {/* Результаты тестирования */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Результаты тестирования:</Label>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Очистить
            </Button>
          </div>
          <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Нажмите кнопки выше для тестирования CRUD операций</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CRUDTestPanel;
