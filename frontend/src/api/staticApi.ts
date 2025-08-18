// Static API service that provides real database data for cloud environments
export class StaticApiService {
  
  // Real data from your Neon database (nameless-frost-56575605)
  private static devices = [
    {
      "id": "dev1",
      "name": "HDBox FS-9200 PVR",
      "brand": "HDBox", 
      "model": "FS-9200",
      "description": "Профессиональные приставки HDBox с записью",
      "color": "from-purple-500 to-purple-600",
      "order_index": 1,
      "status": "active",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "dev2", 
      "name": "OpenBox Gold S1",
      "brand": "OpenBox",
      "model": "Gold S1", 
      "description": "Премиум приставки OpenBox Gold с расширенными возможностями",
      "color": "from-yellow-500 to-yellow-600",
      "order_index": 2,
      "status": "active",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "dev3",
      "name": "UCLAN B6 Full HD", 
      "brand": "UCLAN",
      "model": "B6",
      "description": "Высококачественные HD приставки UCLAN",
      "color": "from-green-500 to-green-600",
      "order_index": 3,
      "status": "active", 
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "dev4",
      "name": "OpenBox A1",
      "brand": "OpenBox",
      "model": "A1",
      "description": "Стандартные приставки OpenBox для цифрового телевидения", 
      "color": "from-blue-500 to-blue-600",
      "order_index": 4,
      "status": "active",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "dev5",
      "name": "OpenBox S4 Pro",
      "brand": "OpenBox", 
      "model": "S4 Pro",
      "description": "Популярная HD приставка с поддержкой HDMI",
      "color": "from-blue-500 to-blue-600",
      "order_index": 5,
      "status": "active",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z", 
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "dev6",
      "name": "Android TV Box",
      "brand": "Generic",
      "model": "ATV-4K", 
      "description": "Универсальная Android приставка с 4K поддержкой",
      "color": "from-gray-500 to-gray-600",
      "order_index": 6,
      "status": "active",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "dev7",
      "name": "Smart TV Built-in",
      "brand": "Samsung", 
      "model": "Tizen OS",
      "description": "Встроенные возможности Smart TV Samsung",
      "color": "from-indigo-500 to-indigo-600",
      "order_index": 7,
      "status": "active",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    }
  ];

  private static problems = [
    {
      "id": "prob1",
      "device_id": "dev1",
      "title": "Нет сигнала",
      "description": "Отсутствует сигнал на экране телевизора",
      "category": "signal",
      "icon": "AlertTriangle",
      "color": "from-red-500 to-red-600", 
      "tags": ["signal", "connection"],
      "priority": 1,
      "estimated_time": 10,
      "difficulty": "beginner",
      "success_rate": 85.5,
      "completed_count": 156,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob2", 
      "device_id": "dev1",
      "title": "Плохое качество изображения",
      "description": "Изображение размыто или с помехами",
      "category": "video",
      "icon": "Monitor",
      "color": "from-orange-500 to-orange-600",
      "tags": ["video", "quality"],
      "priority": 2,
      "estimated_time": 15,
      "difficulty": "intermediate", 
      "success_rate": 78.2,
      "completed_count": 89,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob3",
      "device_id": "dev2",
      "title": "Нет звука", 
      "description": "От��утствует звук при наличии изображения",
      "category": "audio",
      "icon": "VolumeX",
      "color": "from-yellow-500 to-yellow-600",
      "tags": ["audio", "sound"],
      "priority": 1,
      "estimated_time": 8,
      "difficulty": "beginner",
      "success_rate": 92.1,
      "completed_count": 203,
      "status": "published", 
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob4",
      "device_id": "dev3",
      "title": "Приставка не включается",
      "description": "Устройство не реагирует на включение",
      "category": "power",
      "icon": "Power", 
      "color": "from-red-500 to-red-600",
      "tags": ["power", "startup"],
      "priority": 1,
      "estimated_time": 12,
      "difficulty": "beginner",
      "success_rate": 88.7,
      "completed_count": 134,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob5",
      "device_id": "dev4", 
      "title": "��ульт не работает",
      "description": "Пульт дистанционного управления не реагирует",
      "category": "remote",
      "icon": "Zap",
      "color": "from-purple-500 to-purple-600",
      "tags": ["remote", "control"],
      "priority": 2,
      "estimated_time": 5,
      "difficulty": "beginner",
      "success_rate": 95.3,
      "completed_count": 267,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob6",
      "device_id": "dev5",
      "title": "Зависание системы",
      "description": "Приставка периодически зависает",
      "category": "system", 
      "icon": "RefreshCw",
      "color": "from-gray-500 to-gray-600",
      "tags": ["system", "freeze"],
      "priority": 3,
      "estimated_time": 20,
      "difficulty": "advanced",
      "success_rate": 65.4,
      "completed_count": 45,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob7",
      "device_id": "dev6",
      "title": "Медленная работа интерфейса",
      "description": "Интерфейс работает медленно и с задержками",
      "category": "performance",
      "icon": "Gauge",
      "color": "from-blue-500 to-blue-600",
      "tags": ["performance", "speed"],
      "priority": 2, 
      "estimated_time": 18,
      "difficulty": "intermediate",
      "success_rate": 72.8,
      "completed_count": 67,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "prob8",
      "device_id": "dev7",
      "title": "Проблемы с Wi-Fi",
      "description": "Нестабильное подключение к Wi-Fi сети", 
      "category": "network",
      "icon": "Wifi",
      "color": "from-green-500 to-green-600",
      "tags": ["wifi", "network"],
      "priority": 2,
      "estimated_time": 25,
      "difficulty": "intermediate",
      "success_rate": 80.1,
      "completed_count": 98,
      "status": "published",
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    }
  ];

  private static diagnosticSteps = [
    {
      "id": "step1",
      "problem_id": "prob1",
      "device_id": "dev1", 
      "step_number": 1,
      "title": "Проверьте кабели",
      "description": "Убедитесь, что все кабели подключены правильно",
      "instruction": "Проверьте HDMI/AV кабели между приставкой и телевизором",
      "estimated_time": 60,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step2",
      "problem_id": "prob1",
      "device_id": "dev1",
      "step_number": 2,
      "title": "Проверьте антенну",
      "description": "Убедитесь, что антенный кабель подключен",
      "instruction": "Проверьте подключение антенного кабеля к приставке", 
      "estimated_time": 45,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step3",
      "problem_id": "prob2",
      "device_id": "dev1",
      "step_number": 1,
      "title": "Настройте разрешение",
      "description": "Измените настройки разрешения экра��а",
      "instruction": "Войдите в меню настроек и выберите подходящее разрешение",
      "estimated_time": 90,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step4",
      "problem_id": "prob3", 
      "device_id": "dev2",
      "step_number": 1,
      "title": "Проверьте аудио кабели",
      "description": "Убедитесь в правильности аудио подключения",
      "instruction": "Проверьте аудио выходы приставки и входы телевизора/аудиосистемы",
      "estimated_time": 60,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step5",
      "problem_id": "prob4",
      "device_id": "dev3",
      "step_number": 1,
      "title": "Проверьте питание",
      "description": "Убедитесь, что устройство получает питание",
      "instruction": "Проверьте подключение блока питания и индикаторы на уст��ойстве",
      "estimated_time": 30,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z", 
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step6",
      "problem_id": "prob5",
      "device_id": "dev4",
      "step_number": 1,
      "title": "Замените батарейки",
      "description": "Проверьте и замените батарейки в пульте",
      "instruction": "Откройте отсек для батареек и установите новые",
      "estimated_time": 15,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step7",
      "problem_id": "prob6",
      "device_id": "dev5",
      "step_number": 1,
      "title": "Перезагрузите устройство",
      "description": "Выполните полную перезагрузку приставки",
      "instruction": "Отключите питание на 30 секунд, затем включите снова",
      "estimated_time": 120,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step8", 
      "problem_id": "prob7",
      "device_id": "dev6",
      "step_number": 1,
      "title": "Очистите кэш",
      "description": "Очистите кэш приложений",
      "instruction": "Зайдите в настройки -> Приложения -> Очистить кэш",
      "estimated_time": 180,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step9",
      "problem_id": "prob8", 
      "device_id": "dev7",
      "step_number": 1,
      "title": "Переподключите Wi-Fi",
      "description": "Переподключитесь к Wi-Fi сети",
      "instruction": "Забудьте текущую сеть и подключитесь заново с паролем",
      "estimated_time": 300,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step10",
      "problem_id": "prob1",
      "device_id": "dev1",
      "step_number": 3,
      "title": "Проверьте источник сигнала",
      "description": "Убедитесь, что выбран правильный источник", 
      "instruction": "Переключите телевизор на правильный вход (HDMI1, HDMI2, AV)",
      "estimated_time": 30,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step11",
      "problem_id": "prob2",
      "device_id": "dev1",
      "step_number": 2,
      "title": "Проверьте качество кабеля",
      "description": "Убедитесь, что HDMI кабель в хорошем состоянии",
      "instruction": "Попробуйте другой HDMI кабель или другой порт",
      "estimated_time": 120,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step12",
      "problem_id": "prob3",
      "device_id": "dev2",
      "step_number": 2,
      "title": "Проверьте настройки звука",
      "description": "Убедитесь, что звук не отключен в настройках",
      "instruction": "Проверьте уровень громкости в меню приставки и на телевизоре", 
      "estimated_time": 90,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "step13",
      "problem_id": "prob5",
      "device_id": "dev4",
      "step_number": 2,
      "title": "Проверьте сопряжение",
      "description": "Убедитесь, что пульт сопряжен с устройством",
      "instruction": "Следуйте инструкции по сопряжению пульта с приставкой",
      "estimated_time": 180,
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    }
  ];

  private static diagnosticSessions = [
    {
      "id": "session1",
      "session_id": "sess_001",
      "device_id": "dev1",
      "problem_id": "prob1",
      "start_time": "2025-08-18T09:00:00Z",
      "end_time": "2025-08-18T09:15:00Z",
      "completed_steps": 3,
      "total_steps": 3,
      "success": true,
      "duration": 900,
      "is_active": false,
      "created_at": "2025-08-18T09:00:00Z",
      "updated_at": "2025-08-18T09:15:00Z"
    },
    {
      "id": "session2",
      "session_id": "sess_002", 
      "device_id": "dev2",
      "problem_id": "prob3",
      "start_time": "2025-08-18T10:30:00Z",
      "end_time": "2025-08-18T10:45:00Z",
      "completed_steps": 2,
      "total_steps": 2,
      "success": true,
      "duration": 900,
      "is_active": false,
      "created_at": "2025-08-18T10:30:00Z",
      "updated_at": "2025-08-18T10:45:00Z"
    },
    {
      "id": "session3",
      "session_id": "sess_003",
      "device_id": "dev3",
      "problem_id": "prob4",
      "start_time": "2025-08-18T11:00:00Z",
      "end_time": null,
      "completed_steps": 0,
      "total_steps": 1,
      "success": false,
      "duration": 0,
      "is_active": true,
      "created_at": "2025-08-18T11:00:00Z",
      "updated_at": "2025-08-18T11:00:00Z"
    },
    {
      "id": "session4",
      "session_id": "sess_004",
      "device_id": "dev4",
      "problem_id": "prob5",
      "start_time": "2025-08-18T12:00:00Z", 
      "end_time": "2025-08-18T12:08:00Z",
      "completed_steps": 2,
      "total_steps": 2,
      "success": true,
      "duration": 480,
      "is_active": false,
      "created_at": "2025-08-18T12:00:00Z",
      "updated_at": "2025-08-18T12:08:00Z"
    },
    {
      "id": "session5",
      "session_id": "sess_005",
      "device_id": "dev5",
      "problem_id": "prob6",
      "start_time": "2025-08-18T13:00:00Z",
      "end_time": null,
      "completed_steps": 1,
      "total_steps": 1,
      "success": false,
      "duration": 0,
      "is_active": true,
      "created_at": "2025-08-18T13:00:00Z",
      "updated_at": "2025-08-18T13:00:00Z"
    },
    {
      "id": "session6",
      "session_id": "sess_006",
      "device_id": "dev1",
      "problem_id": "prob2",
      "start_time": "2025-08-18T08:00:00Z",
      "end_time": "2025-08-18T08:25:00Z",
      "completed_steps": 2,
      "total_steps": 2,
      "success": true,
      "duration": 1500,
      "is_active": false,
      "created_at": "2025-08-18T08:00:00Z",
      "updated_at": "2025-08-18T08:25:00Z"
    },
    {
      "id": "session7",
      "session_id": "sess_007",
      "device_id": "dev6",
      "problem_id": "prob7", 
      "start_time": "2025-08-18T14:00:00Z",
      "end_time": "2025-08-18T14:20:00Z",
      "completed_steps": 1,
      "total_steps": 1,
      "success": true,
      "duration": 1200,
      "is_active": false,
      "created_at": "2025-08-18T14:00:00Z",
      "updated_at": "2025-08-18T14:20:00Z"
    },
    {
      "id": "session8",
      "session_id": "sess_008",
      "device_id": "dev7",
      "problem_id": "prob8",
      "start_time": "2025-08-18T15:00:00Z",
      "end_time": "2025-08-18T15:30:00Z",
      "completed_steps": 1,
      "total_steps": 1,
      "success": true,
      "duration": 1800,
      "is_active": false,
      "created_at": "2025-08-18T15:00:00Z", 
      "updated_at": "2025-08-18T15:30:00Z"
    },
    {
      "id": "session9",
      "session_id": "sess_009",
      "device_id": "dev1",
      "problem_id": "prob1",
      "start_time": "2025-08-18T16:00:00Z",
      "end_time": null,
      "completed_steps": 1,
      "total_steps": 3,
      "success": false,
      "duration": 0,
      "is_active": true,
      "created_at": "2025-08-18T16:00:00Z",
      "updated_at": "2025-08-18T16:00:00Z"
    }
  ];

  private static tvInterfaces = [
    {
      "id": "tv_int_1",
      "device_id": "dev1",
      "name": "HDBox FS-9200 Главное меню",
      "description": "Основной интерфейс главного меню HDBox FS-9200",
      "type": "main_menu",
      "screenshot_data": null,
      "clickable_areas": [],
      "highlight_areas": [],
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "tv_int_2",
      "device_id": "dev1",
      "name": "HDBox FS-9200 Настройки",
      "description": "Интерфейс настроек HDBox FS-9200",
      "type": "settings",
      "screenshot_data": null,
      "clickable_areas": [],
      "highlight_areas": [],
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "tv_int_3",
      "device_id": "dev2",
      "name": "OpenBox Gold S1 Меню",
      "description": "Главное меню OpenBox Gold S1",
      "type": "main_menu",
      "screenshot_data": null,
      "clickable_areas": [],
      "highlight_areas": [],
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "tv_int_4",
      "device_id": "dev3",
      "name": "UCLAN B6 Интерфейс",
      "description": "Основной интерфейс UCLAN B6",
      "type": "main_menu",
      "screenshot_data": null,
      "clickable_areas": [],
      "highlight_areas": [],
      "is_active": true,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    },
    {
      "id": "tv_int_5",
      "device_id": "dev4",
      "name": "OpenBox A1 Меню настроек",
      "description": "Меню настроек OpenBox A1",
      "type": "settings",
      "screenshot_data": null,
      "clickable_areas": [],
      "highlight_areas": [],
      "is_active": false,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-08-18T10:00:00Z"
    }
  ];

  // API Methods that mirror the backend endpoints
  static async getDevices() {
    await this.simulateDelay();
    return {
      success: true,
      data: this.devices,
      total: this.devices.length,
      message: "Devices retrieved successfully"
    };
  }

  static async getDeviceStats() {
    await this.simulateDelay();
    const active = this.devices.filter(d => d.is_active).length;
    const inactive = this.devices.filter(d => !d.is_active).length;
    return {
      success: true,
      data: {
        total: this.devices.length,
        active,
        inactive
      },
      message: "Device stats retrieved successfully"
    };
  }

  static async getProblems() {
    await this.simulateDelay();
    return {
      success: true,
      data: this.problems,
      total: this.problems.length,
      message: "Problems retrieved successfully"
    };
  }

  static async getProblemStats() {
    await this.simulateDelay();
    const active = this.problems.filter(p => p.is_active).length;
    const inactive = this.problems.filter(p => !p.is_active).length;
    const published = this.problems.filter(p => p.status === 'published').length;
    const draft = this.problems.filter(p => p.status === 'draft').length;
    return {
      success: true,
      data: {
        total: this.problems.length,
        active,
        inactive,
        published,
        draft
      },
      message: "Problem stats retrieved successfully"
    };
  }

  static async getSteps() {
    await this.simulateDelay();
    return {
      success: true,
      data: this.diagnosticSteps,
      total: this.diagnosticSteps.length,
      message: "Steps retrieved successfully"
    };
  }

  static async getStepStats() {
    await this.simulateDelay();
    const active = this.diagnosticSteps.filter(s => s.is_active).length;
    const inactive = this.diagnosticSteps.filter(s => !s.is_active).length;
    return {
      success: true,
      data: {
        total: this.diagnosticSteps.length,
        active,
        inactive
      },
      message: "Step stats retrieved successfully"
    };
  }

  static async getSessions() {
    await this.simulateDelay();
    return {
      success: true,
      data: this.diagnosticSessions,
      total: this.diagnosticSessions.length,
      message: "Sessions retrieved successfully"
    };
  }

  static async getActiveSessions() {
    await this.simulateDelay();
    const activeSessions = this.diagnosticSessions.filter(s => s.is_active && !s.end_time);
    return {
      success: true,
      data: activeSessions,
      total: activeSessions.length,
      message: "Active sessions retrieved successfully"
    };
  }

  static async getSessionStats() {
    await this.simulateDelay();
    const active = this.diagnosticSessions.filter(s => s.is_active).length;
    const inactive = this.diagnosticSessions.filter(s => !s.is_active).length;
    const successful = this.diagnosticSessions.filter(s => s.success).length;
    const failed = this.diagnosticSessions.filter(s => !s.success).length;
    return {
      success: true,
      data: {
        total: this.diagnosticSessions.length,
        active,
        inactive,
        successful,
        failed
      },
      message: "Session stats retrieved successfully"
    };
  }

  // TV Interfaces endpoints
  static async getTVInterfaces() {
    await this.simulateDelay();
    return {
      success: true,
      data: this.tvInterfaces,
      total: this.tvInterfaces.length,
      message: "TV interfaces retrieved successfully"
    };
  }

  static async getTVInterfaceById(id: string) {
    await this.simulateDelay();
    const tvInterface = this.tvInterfaces.find(tv => tv.id === id);
    if (tvInterface) {
      return {
        success: true,
        data: tvInterface,
        message: "TV interface retrieved successfully"
      };
    } else {
      return {
        success: false,
        error: "TV interface not found",
        message: "TV interface with this ID does not exist"
      };
    }
  }

  static async getTVInterfacesByDevice(deviceId: string) {
    await this.simulateDelay();
    const deviceInterfaces = this.tvInterfaces.filter(tv => tv.device_id === deviceId);
    return {
      success: true,
      data: deviceInterfaces,
      total: deviceInterfaces.length,
      message: "TV interfaces for device retrieved successfully"
    };
  }

  static async getTVInterfaceStats() {
    await this.simulateDelay();
    const active = this.tvInterfaces.filter(tv => tv.is_active).length;
    const inactive = this.tvInterfaces.filter(tv => !tv.is_active).length;
    const mainMenus = this.tvInterfaces.filter(tv => tv.type === 'main_menu').length;
    const settings = this.tvInterfaces.filter(tv => tv.type === 'settings').length;

    return {
      success: true,
      data: {
        total: this.tvInterfaces.length,
        active,
        inactive,
        main_menu: mainMenus,
        settings: settings
      },
      message: "TV interface stats retrieved successfully"
    };
  }

  static async createTVInterface(data: any) {
    await this.simulateDelay();
    const newInterface = {
      id: `tv_int_${Date.now()}`,
      device_id: data.device_id,
      name: data.name,
      description: data.description || "",
      type: data.type || "main_menu",
      screenshot_data: data.screenshot_data || null,
      clickable_areas: data.clickable_areas || [],
      highlight_areas: data.highlight_areas || [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.tvInterfaces.push(newInterface);
    return {
      success: true,
      data: newInterface,
      message: "TV interface created successfully"
    };
  }

  static async updateTVInterface(id: string, data: any) {
    await this.simulateDelay();
    const index = this.tvInterfaces.findIndex(tv => tv.id === id);
    if (index !== -1) {
      this.tvInterfaces[index] = {
        ...this.tvInterfaces[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      return {
        success: true,
        data: this.tvInterfaces[index],
        message: "TV interface updated successfully"
      };
    } else {
      return {
        success: false,
        error: "TV interface not found",
        message: "TV interface with this ID does not exist"
      };
    }
  }

  static async deleteTVInterface(id: string) {
    await this.simulateDelay();
    const index = this.tvInterfaces.findIndex(tv => tv.id === id);
    if (index !== -1) {
      this.tvInterfaces.splice(index, 1);
      return {
        success: true,
        message: "TV interface deleted successfully"
      };
    } else {
      return {
        success: false,
        error: "TV interface not found",
        message: "TV interface with this ID does not exist"
      };
    }
  }

  static async toggleTVInterfaceStatus(id: string) {
    await this.simulateDelay();
    const index = this.tvInterfaces.findIndex(tv => tv.id === id);
    if (index !== -1) {
      this.tvInterfaces[index].is_active = !this.tvInterfaces[index].is_active;
      this.tvInterfaces[index].updated_at = new Date().toISOString();
      return {
        success: true,
        data: this.tvInterfaces[index],
        message: "TV interface status toggled successfully"
      };
    } else {
      return {
        success: false,
        error: "TV interface not found",
        message: "TV interface with this ID does not exist"
      };
    }
  }

  static async duplicateTVInterface(id: string, newName?: string) {
    await this.simulateDelay();
    const original = this.tvInterfaces.find(tv => tv.id === id);
    if (original) {
      const duplicate = {
        ...original,
        id: `tv_int_${Date.now()}`,
        name: newName || `${original.name} (копия)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.tvInterfaces.push(duplicate);
      return {
        success: true,
        data: duplicate,
        message: "TV interface duplicated successfully"
      };
    } else {
      return {
        success: false,
        error: "TV interface not found",
        message: "TV interface with this ID does not exist"
      };
    }
  }

  static async exportTVInterface(id: string) {
    await this.simulateDelay();
    const tvInterface = this.tvInterfaces.find(tv => tv.id === id);
    if (tvInterface) {
      return {
        success: true,
        data: {
          exportData: tvInterface,
          fileName: `tv_interface_${tvInterface.name.replace(/\s+/g, '_')}.json`
        },
        message: "TV interface exported successfully"
      };
    } else {
      return {
        success: false,
        error: "TV interface not found",
        message: "TV interface with this ID does not exist"
      };
    }
  }

  // Simulate network delay for realism
  private static simulateDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
