# 快速參考卡

## 🚀 一鍵啟動

```bash
cd backend
python main.py
```

訪問: `http://localhost:8000/docs`

## 📡 API 端點速查

### 1. 主查詢 ⭐

```
GET /api/awards?year=113&code=QS01&name=李文廷
```

**返回:** 符合條件的獎項列表（自動填充快取）

### 2. 快速查詢 ⭐⭐ (推薦用於前端展示)

```
GET /api/awards/{plan_name}
```

**返回:** 特定計畫的獎項數據（快取查詢，O(1) 性能）

### 3. 詳情查詢

```
GET /api/awards/detail/{project_no}
```

**返回:** 計畫的完整概述

### 4. 健康檢查

```
GET /api/health
```

**返回:** `{"status": "healthy"}`

## 📊 返回數據結構

```json
{
  "award_year": "113",
  "pi_name": "主持人",
  "organ": "機構",
  "plan_name": "⭐ 計畫名稱",
  "period": "執行期限",
  "total_amount": "經費",
  "impact": "計畫概述",
  "keywords_zh": "中文關鍵字",
  "keywords_en": "英文關鍵字",
  "project_no": "計畫編號"
}
```

## 🔗 前端調用示例

### JavaScript (Fetch)

```javascript
// 獲取獎項列表
const awards = await fetch(
  "http://localhost:8000/api/awards?year=113&code=QS01&name=李文廷"
).then((r) => r.json());

// 遍歷顯示
awards.forEach((award) => {
  console.log(award.plan_name);
  console.log(award.impact);
  console.log(award.keywords_zh);
});
```

### JavaScript (Axios)

```javascript
const awards = await axios.get("http://localhost:8000/api/awards", {
  params: { year: 113, code: "QS01", name: "李文廷" },
});
```

### Python (Requests)

```python
response = requests.get('http://localhost:8000/api/awards', params={
    'year': 113,
    'code': 'QS01',
    'name': '李文廷'
})
awards = response.json()
```

## 📦 項目文件結構

```
backend/
├── main.py              # ⭐ API 應用
├── crawler.py           # 爬蟲邏輯
├── models.py            # 數據模型
├── config.py            # 配置
├── test_api.py          # 測試
├── requirements.txt     # 依賴
├── run.sh / run.bat     # 啟動
└── README.md / ARCHITECTURE.md / ...
```

## 🔧 常見命令

```bash
# 1. 進入後端目錄
cd backend

# 2. 安裝依賴
pip install -r requirements.txt

# 3. 啟動服務
python main.py

# 4. 運行測試
python test_api.py

# 5. 查看 API 文檔
# 訪問: http://localhost:8000/docs

# 6. 停止服務
# Ctrl + C
```

## ✨ 核心特性

| 特性          | 說明                |
| ------------- | ------------------- |
| **REST API**  | 標準 HTTP 請求/響應 |
| **快取機制**  | plan_name 快速查詢  |
| **自動文檔**  | Swagger UI 交互測試 |
| **CORS 支持** | 跨域請求配置        |
| **錯誤處理**  | 詳細的錯誤信息      |

## 🎯 使用流程

1. **啟動後端**

   ```bash
   python main.py
   ```

2. **查詢數據**

   ```
   GET /api/awards?year=113&code=QS01&name=李文廷
   ```

3. **使用計畫名稱查詢**（可選，需先執行步驟 2）

   ```
   GET /api/awards/計畫名稱
   ```

4. **在前端展示**
   ```javascript
   const response = await fetch("http://localhost:8000/api/awards?...");
   const data = await response.json();
   // 展示 data
   ```

## 🐛 常見問題

| 問題               | 解決方案                               |
| ------------------ | -------------------------------------- |
| Connection refused | 確保服務運行在 http://localhost:8000   |
| CORS 錯誤          | 檢查 main.py 的 CORS 配置              |
| 模塊未找到         | 運行 `pip install -r requirements.txt` |
| 爬蟲超時           | 增加 CRAWLER_TIMEOUT 或檢查網絡        |

## 📚 詳細文檔

- [README.md](README.md) - 完整使用指南
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架構設計詳解
- [REFACTORING_SUMMARY.md](../REFACTORING_SUMMARY.md) - 重構總結

---

**更新時間:** 2024 年 12 月  
**API 版本:** 1.0.0
