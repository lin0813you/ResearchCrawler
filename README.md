# Research Crawler - 全棧項目

NSTC 獎項資料爬蟲與可視化平台

## 📁 項目結構

```
ResearchCrawler/
├── backend/                    # 後端 REST API
│   ├── main.py                # FastAPI 主應用
│   ├── crawler.py             # 爬蟲邏輯
│   ├── models.py              # 數據模型
│   ├── config.py              # 配置檔案
│   ├── requirements.txt        # Python 依賴
│   ├── test_api.py            # API 測試腳本
│   ├── run.sh / run.bat       # 啟動腳本
│   └── README.md              # 後端文檔
│
├── frontend/                   # 前端應用
│   ├── src/
│   │   ├── App.jsx            # 主應用組件
│   │   ├── main.jsx           # 入口文件
│   │   └── styles.css         # 全局樣式
│   ├── index.html             # HTML 入口
│   ├── package.json           # Node.js 依賴
│   └── vite.config.js         # Vite 配置
│
└── README.md                  # 本文件
```

## 🚀 快速開始

### 後端設置

1. **安裝依賴**

```bash
cd backend
pip install -r requirements.txt
```

2. **啟動服務**

Windows:

```bash
run.bat
```

Linux/Mac:

```bash
chmod +x run.sh
./run.sh
```

或直接使用 Python:

```bash
python main.py
```

服務會在 `http://localhost:8000` 啟動

3. **檢查 API 文檔**
   訪問 `http://localhost:8000/docs` 查看完整的 API 文檔

### 前端設置（計劃）

```bash
cd frontend
npm install
npm run dev
```

## 📊 API 端點

### 基礎端點

| 方法 | 端點                              | 說明             |
| ---- | --------------------------------- | ---------------- |
| GET  | `/api/health`                     | 健康檢查         |
| GET  | `/api/awards`                     | 查詢獎項資料     |
| GET  | `/api/awards/{plan_name}`         | 根據計畫名稱查詢 |
| GET  | `/api/awards/detail/{project_no}` | 獲取計畫詳細信息 |

### 查詢示例

**查詢獎項**

```bash
curl "http://localhost:8000/api/awards?year=113&code=QS01&name=李文廷"
```

**根據計畫名稱查詢**

```bash
curl "http://localhost:8000/api/awards/計畫名稱"
```

**獲取詳細信息**

```bash
curl "http://localhost:8000/api/awards/detail/113WFA2110082"
```

## 📋 返回的數據欄位

所有 API 返回包含以下字段的 JSON 數據：

```json
{
  "award_year": "113", // 獲獎年份
  "pi_name": "主持人姓名", // 主持人姓名
  "organ": "機構名稱", // 所屬機構
  "plan_name": "計畫名稱", // 計畫名稱 ⭐ API 路由使用
  "period": "2024/08/01～2025/07/31", // 執行期限
  "total_amount": "1,500,000", // 總核定金額
  "impact": "計畫概述...", // 計畫概述
  "keywords_zh": "關鍵詞1;關鍵詞2", // 中文關鍵字
  "keywords_en": "keyword1;keyword2", // 英文關鍵字
  "project_no": "113WFA2110082" // 計畫編號 ⭐ 用於獲取詳細信息
}
```

## 🏗️ 後端架構設計

### 核心組件

1. **crawler.py** - 爬蟲層

   - `TLS12Adapter`: 自訂 HTTPS 適配器
   - `NSTCAwardClient`: 爬蟲客戶端，負責網絡請求和數據解析

2. **models.py** - 數據層

   - `AwardItem`: 獎項數據模型，使用 dataclass 定義

3. **main.py** - API 層
   - FastAPI 應用
   - 路由定義
   - 快取管理
   - 錯誤處理

### 快取機制

- **類型**: 內存字典快取
- **Key**: 計畫名稱 (plan_name)
- **Value**: 獎項數據列表
- **作用**: 支持通過 `/api/awards/{plan_name}` 直接查詢

### 使用流程

```
前端請求查詢
    ↓
main.py 路由處理
    ↓
crawler.py 發起爬蟲
    ↓
解析網頁並構建 AwardItem
    ↓
存入快取 + 返回響應
    ↓
前端接收並渲染
```

## 🔧 測試

### 運行 API 測試

```bash
cd backend
python test_api.py
```

測試腳本會執行以下檢查：

- ✅ 健康檢查
- ✅ 查詢獎項數據
- ✅ 根據計畫名稱查詢
- ✅ 獲取計畫詳細信息

## 📝 配置

編輯 `backend/config.py` 自訂以下設置：

```python
# 服務器配置
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000
DEBUG = True

# 爬蟲超時
CRAWLER_TIMEOUT = 30

# CORS 配置（前端域名）
CORS_ORIGINS = ["http://localhost:5173"]
```

## 🌐 前端集成指南

前端可通過以下方式調用 API：

### 使用 fetch

```javascript
// 查詢獎項
const response = await fetch(
  "http://localhost:8000/api/awards?year=113&code=QS01&name=李文廷"
);
const awards = await response.json();
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

## 🐛 常見問題

### Q: 獲得 "Connection refused" 錯誤

**A**: 確保後端服務已啟動在 `http://localhost:8000`

### Q: 獲得 CORS 錯誤

**A**: 檢查 `main.py` 中的 CORS 配置，確保前端域名在允許列表中

### Q: 爬蟲超時

**A**: 增加 `CRAWLER_TIMEOUT` 的值或檢查網絡連接

## 🚧 計劃中的改進

- [ ] 數據庫持久化（SQLite/PostgreSQL）
- [ ] Redis 快取層
- [ ] 異步爬蟲任務隊列（Celery）
- [ ] 前端 UI 完善
- [ ] 單元測試和集成測試
- [ ] Docker 容器化部署
- [ ] CI/CD 流程

## 📚 技術棧

### 後端

- **Python 3.8+**
- **FastAPI** - 現代 Web 框架
- **Uvicorn** - ASGI 服務器
- **BeautifulSoup4** - HTML 解析
- **Requests** - HTTP 客戶端

### 前端

- **React + Vite** - 現代化前端框架
- **TBD** - 組件庫/樣式方案

## 📄 許可證

MIT License

## 👤 作者

Created with ❤️

---

**需要幫助？** 查看各個模塊的 README.md 文件或查閱 API 文檔 `/docs`
