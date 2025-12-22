# ResearchCrawler Backend API

NSTC 獎項資料爬蟲 REST API 服務

## 架構

```
backend/
├── main.py           # FastAPI 主應用和路由定義
├── crawler.py        # 網頁爬蟲邏輯（NSTCAwardClient）
├── models.py         # 數據模型定義（AwardItem）
├── requirements.txt  # 專案依賴
└── README.md        # 本文件
```

## 安裝和運行

### 1. 安裝依賴

```bash
cd backend
pip install -r requirements.txt
```

### 2. 運行服務

```bash
python main.py
```

或使用 uvicorn 直接運行：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服務將在 `http://localhost:8000` 啟動

### 3. API 文檔

FastAPI 自動生成的 API 文檔（Swagger UI）：

- http://localhost:8000/docs

ReDoc 文檔：

- http://localhost:8000/redoc

## API 端點

### 1. 健康檢查

```
GET /api/health
```

**回應：**

```json
{
  "status": "healthy"
}
```

### 2. 查詢獎項資料（主查詢端點）

```
GET /api/awards?year=113&code=QS01&name=李文廷
```

**必要查詢參數：**

- `year` (int): 民國年份，例如 113
- `code` (str): 獎項代碼，例如 QS01
- `name` (str): 主持人姓名

**可選查詢參數：**

- `organ` (str): 機構名稱

**回應示例：**

```json
[
  {
    "award_year": "113",
    "pi_name": "李文廷",
    "organ": "國立臺灣大學",
    "plan_name": "主持人計畫標題",
    "period": "2024/08/01～2025/07/31",
    "total_amount": "1,500,000",
    "impact": "計畫概述說明...",
    "keywords_zh": "關鍵詞1;關鍵詞2",
    "keywords_en": "keyword1;keyword2",
    "project_no": "113WFA2110082"
  }
]
```

### 3. 根據計畫名稱查詢（基於快取）

```
GET /api/awards/{plan_name}
```

**路由參數：**

- `plan_name` (str): 計畫名稱（需先通過端點 2 進行查詢以填充快取）

**說明：**
此端點從內存快取查詢數據。首先必須調用**端點 2**進行查詢，以將數據存入快取，然後才能使用此端點。

**範例：**

```
GET /api/awards/主持人計畫標題
```

### 4. 獲取計畫詳細信息

```
GET /api/awards/detail/{project_no}
```

**路由參數：**

- `project_no` (str): 計畫編號，例如 113WFA2110082

**回應示例：**

```json
{
  "project_no": "113WFA2110082",
  "impact": "詳細的計畫概述信息..."
}
```

## 使用流程

### 場景 1：查詢所有符合條件的獎項

1. 調用 `/api/awards` 端點進行查詢：

```bash
curl "http://localhost:8000/api/awards?year=113&code=QS01&name=李文廷"
```

2. 獲取結果（自動填充內存快取）

### 場景 2：獲取特定計畫的詳細信息

1. 先調用 `/api/awards` 獲取計畫列表和 project_no
2. 再調用 `/api/awards/detail/{project_no}` 獲取詳細信息：

```bash
curl "http://localhost:8000/api/awards/detail/113WFA2110082"
```

### 場景 3：根據計畫名稱直接查詢

1. 先調用 `/api/awards` 進行查詢（填充快取）
2. 再調用 `/api/awards/{plan_name}` 直接查詢：

```bash
curl "http://localhost:8000/api/awards/主持人計畫標題"
```

## 數據模型

### AwardItem

爬取的獎項資料模型：

| 欄位           | 類型        | 說明       |
| -------------- | ----------- | ---------- |
| `award_year`   | str         | 獲獎年份   |
| `pi_name`      | str         | 主持人姓名 |
| `organ`        | str         | 所屬機構   |
| `plan_name`    | str         | 計畫名稱   |
| `period`       | str         | 執行期限   |
| `total_amount` | str         | 總核定金額 |
| `impact`       | str         | 計畫概述   |
| `keywords_zh`  | str         | 中文關鍵字 |
| `keywords_en`  | str         | 英文關鍵字 |
| `project_no`   | str \| null | 計畫編號   |

## 架構優化建議

### 當前實現

- 使用**內存快取**存儲已爬取的數據
- 適合小規模查詢場景

### 進階改進方案

1. **數據庫持久化**（推薦）

   - 使用 SQLite/PostgreSQL 存儲爬取的數據
   - 避免重複爬取相同數據
   - 支持更復雜的查詢

2. **后台任務隊列**

   - 使用 Celery 進行異步爬蟲任務
   - 支持批量查詢和定時更新

3. **緩存層**
   - 使用 Redis 替代內存快取
   - 支持分佈式部署
   - 設置過期時間自動清理

## CORS 配置

當前配置允許所有來源的跨域請求。生產環境應修改為具體的前端域名：

```python
allow_origins=["http://localhost:5173", "https://yourdomain.com"]
```

## 錯誤處理

API 返回以下 HTTP 狀態碼：

| 狀態碼 | 說明                   |
| ------ | ---------------------- |
| 200    | 成功                   |
| 404    | 未找到符合條件的數據   |
| 500    | 服務器錯誤（爬蟲異常） |

## 前端集成

### 使用 fetch API

```javascript
// 查詢獎項
const response = await fetch(
  "http://localhost:8000/api/awards?year=113&code=QS01&name=李文廷"
);
const data = await response.json();
console.log(data);
```

### 使用 axios

```javascript
import axios from "axios";

const awards = await axios.get("http://localhost:8000/api/awards", {
  params: {
    year: 113,
    code: "QS01",
    name: "李文廷",
  },
});
```

## 注意事項

1. **網絡連接**：爬蟲需要連接到外部 NSTC 網站，請確保網絡正常
2. **超時設置**：默認超時為 30 秒，可在 `NSTCAwardClient` 初始化時修改
3. **速率限制**：建議在實際部署時添加速率限制避免過度爬蟲
4. **數據更新**：當前使用內存快取，重啟服務器會清空數據
