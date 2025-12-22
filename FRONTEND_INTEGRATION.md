# 前端集成指南

本文檔指導您如何在前端應用中集成後端 REST API。

## 🎯 集成概述

後端 API 提供了完整的獎項數據查詢功能，前端需要通過 HTTP 請求調用這些 API 端點。

## 🔗 API 端點

| 端點                              | 方法 | 用途                   |
| --------------------------------- | ---- | ---------------------- |
| `/api/health`                     | GET  | 檢查服務狀態           |
| `/api/awards`                     | GET  | 查詢獎項列表（主查詢） |
| `/api/awards/{plan_name}`         | GET  | 快速查詢特定計畫       |
| `/api/awards/detail/{project_no}` | GET  | 獲取計畫詳細信息       |

## 📝 使用示例

### 基礎 URL

```javascript
const API_BASE_URL = "http://localhost:8000";

// 或在生產環境
const API_BASE_URL = "https://your-api-domain.com";
```

### 1. 查詢獎項

**場景**: 用戶在前端搜索框輸入條件進行查詢

```javascript
async function searchAwards(year, code, name, organ = "") {
  const params = new URLSearchParams({
    year: year.toString(),
    code: code,
    name: name,
  });

  if (organ) {
    params.append("organ", organ);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/awards?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const awards = await response.json();
    return awards;
  } catch (error) {
    console.error("查詢失敗:", error);
    return [];
  }
}

// 使用
const awards = await searchAwards(113, "QS01", "李文廷");
```

### 2. 使用 Axios（推薦）

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    Accept: "application/json",
  },
});

async function searchAwards(year, code, name, organ = "") {
  try {
    const response = await API.get("/api/awards", {
      params: {
        year,
        code,
        name,
        organ,
      },
    });
    return response.data;
  } catch (error) {
    console.error("查詢失敗:", error);
    return [];
  }
}
```

### 3. 快速查詢計畫

**場景**: 已有計畫名稱，需要快速查詢數據

```javascript
async function searchByPlanName(planName) {
  try {
    const encoded = encodeURIComponent(planName);
    const response = await fetch(`${API_BASE_URL}/api/awards/${encoded}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("計畫未找到，請先進行查詢以填充快取");
      }
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("查詢失敗:", error);
    return [];
  }
}

// 使用
const awards = await searchByPlanName("計畫名稱");
```

### 4. 獲取詳細信息

**場景**: 用戶點擊獎項查看詳細計畫概述

```javascript
async function getProjectDetail(projectNo) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/awards/detail/${projectNo}`
    );

    if (!response.ok) {
      throw new Error(`無法獲取詳細信息: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("獲取詳細信息失敗:", error);
    return null;
  }
}

// 使用
const detail = await getProjectDetail("113WFA2110082");
console.log(detail.impact); // 完整概述
```

## 🎨 React 組件示例

### 1. 搜索組件

```jsx
import React, { useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export function AwardSearch() {
  const [formData, setFormData] = useState({
    year: 113,
    code: "QS01",
    name: "",
    organ: "",
  });

  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await API.get("/api/awards", {
        params: formData,
      });
      setAwards(response.data);
    } catch (err) {
      setError(err.message);
      setAwards([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="award-search">
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="民國年份"
        />
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="獎項代碼"
        />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="主持人姓名"
          required
        />
        <input
          type="text"
          name="organ"
          value={formData.organ}
          onChange={handleChange}
          placeholder="機構名稱（可選）"
        />
        <button type="submit" disabled={loading}>
          {loading ? "搜索中..." : "搜索"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {awards.length > 0 ? (
          <ul>
            {awards.map((award, idx) => (
              <li key={idx}>
                <h3>{award.plan_name}</h3>
                <p>主持人: {award.pi_name}</p>
                <p>機構: {award.organ}</p>
                <p>金額: {award.total_amount}</p>
              </li>
            ))}
          </ul>
        ) : loading ? (
          <p>加載中...</p>
        ) : (
          <p>未找到結果</p>
        )}
      </div>
    </div>
  );
}
```

### 2. 詳情卡片組件

```jsx
import React, { useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export function AwardCard({ award }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setLoading(true);
    try {
      const response = await API.get(`/api/awards/detail/${award.project_no}`);
      setDetail(response.data);
      setExpanded(true);
    } catch (error) {
      console.error("無法獲取詳細信息:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="award-card">
      <div className="award-header">
        <h2>{award.plan_name}</h2>
        <button onClick={handleExpand}>{expanded ? "收起" : "詳情"}</button>
      </div>

      <div className="award-info">
        <p>
          <strong>主持人:</strong> {award.pi_name}
        </p>
        <p>
          <strong>機構:</strong> {award.organ}
        </p>
        <p>
          <strong>年份:</strong> {award.award_year}
        </p>
        <p>
          <strong>期限:</strong> {award.period}
        </p>
        <p>
          <strong>經費:</strong> {award.total_amount}
        </p>
        <p>
          <strong>中文關鍵字:</strong> {award.keywords_zh}
        </p>
        <p>
          <strong>英文關鍵字:</strong> {award.keywords_en}
        </p>
      </div>

      {expanded && (
        <div className="award-detail">
          {loading ? (
            <p>加載詳情中...</p>
          ) : detail ? (
            <>
              <h3>計畫概述</h3>
              <p>{detail.impact}</p>
            </>
          ) : (
            <p>無法加載詳情</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## 📱 Vue 3 組件示例

```vue
<template>
  <div class="award-search">
    <form @submit.prevent="search">
      <input v-model="form.year" type="number" placeholder="民國年份" />
      <input v-model="form.code" type="text" placeholder="獎項代碼" />
      <input
        v-model="form.name"
        type="text"
        placeholder="主持人姓名"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? "搜索中..." : "搜索" }}
      </button>
    </form>

    <div class="results">
      <div v-if="error" class="error">{{ error }}</div>
      <ul v-if="awards.length > 0">
        <li v-for="award in awards" :key="award.plan_name">
          <h3>{{ award.plan_name }}</h3>
          <p>主持人: {{ award.pi_name }}</p>
          <p>概述: {{ award.impact }}</p>
        </li>
      </ul>
      <p v-else>{{ loading ? "加載中..." : "未找到結果" }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

const form = ref({
  year: 113,
  code: "QS01",
  name: "",
  organ: "",
});

const awards = ref([]);
const loading = ref(false);
const error = ref(null);

const search = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await API.get("/api/awards", {
      params: form.value,
    });
    awards.value = response.data;
  } catch (err) {
    error.value = err.message;
    awards.value = [];
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.award-search {
  padding: 20px;
}

form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input,
button {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: red;
  margin: 10px 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
}
</style>
```

## 🔐 環境配置

### 開發環境

```javascript
const API_BASE_URL = "http://localhost:8000";
```

### 生產環境

```javascript
const API_BASE_URL = "https://api.yourdomain.com";
```

### 環境變數配置 (.env)

```
VITE_API_BASE_URL=http://localhost:8000
```

## 🚨 錯誤處理

```javascript
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error("資源未找到");
        case 500:
          throw new Error("伺服器錯誤");
        default:
          throw new Error(`HTTP ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("API 請求失敗:", error);
    // 重新拋出或返回默認值
    throw error;
  }
}
```

## 📦 HTTP 客戶端設置

### Axios 配置

```javascript
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 請求攔截器
api.interceptors.request.use((config) => {
  console.log("API 請求:", config.url);
  return config;
});

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log("API 響應:", response.data);
    return response.data;
  },
  (error) => {
    console.error("API 錯誤:", error.message);
    return Promise.reject(error);
  }
);
```

## 💾 數據緩存

```javascript
class AwardCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

// 使用
const cache = new AwardCache();

async function searchAwardsWithCache(params) {
  const key = JSON.stringify(params);

  if (cache.get(key)) {
    console.log("使用緩存數據");
    return cache.get(key);
  }

  const data = await searchAwards(params);
  cache.set(key, data);
  return data;
}
```

## 🎯 最佳實踐

1. **始終驗證 URL 參數**

   ```javascript
   const encoded = encodeURIComponent(planName);
   ```

2. **使用環境變數配置 API 地址**

   ```javascript
   const baseUrl = process.env.VITE_API_BASE_URL;
   ```

3. **實現適當的加載和錯誤狀態**

   ```javascript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   ```

4. **使用 HTTP 客戶端庫（Axios/Fetch）**

   ```javascript
   const response = await api.get("/api/awards", { params });
   ```

5. **緩存頻繁查詢的數據**
   ```javascript
   const cache = new Map();
   ```

---

**下一步**: 參考 [README.md](README.md) 了解完整的 API 文檔
