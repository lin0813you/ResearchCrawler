# ResearchCrawler

ResearchCrawler 是一個全端專案，使用者只需輸入主持人姓名（pi_name），後端會自動查詢近五年（114–110 年度）的研究資料並回傳，前端將資料以中文欄位完整呈現。

## 功能重點

- 單一輸入（pi_name）完成查詢
- 自動涵蓋近五年資料（114–110）
- 結果包含計畫名稱、主持人、機構、期程、金額、摘要、關鍵字、計畫編號
- 支援 AWS Serverless 部署（Lambda + API Gateway + S3 + CloudFront）

## 專案結構

```
ResearchCrawler/
├── backend/                 # FastAPI 後端與爬蟲
│   ├── main.py
│   ├── crawler.py
│   ├── models.py
│   ├── lambda_handler.py    # Lambda 入口（Mangum）
│   └── requirements.txt
├── frontend/                # React + Vite 前端
│   ├── src/
│   ├── index.html
│   └── vite.config.js
├── template.yaml            # AWS SAM Serverless 部署
└── README.md
```

## 本機啟動

### 後端

```bash
cd backend
pip install -r requirements.txt
python main.py
```

服務會啟動在 `http://localhost:8000`

### 前端

```bash
cd frontend
npm install
```

建立 `frontend/.env` 並填入 API Base URL：

```ini
VITE_API_BASE_URL=http://localhost:8000
```

啟動：

```bash
npm run dev
```

## API 端點

| 方法 | 端點                              | 說明 |
| ---- | --------------------------------- | ---- |
| GET  | `/api/health`                     | 健康檢查 |
| GET  | `/api/awards`                     | 依 pi_name 查詢近五年資料 |
| GET  | `/api/awards/{plan_name}`         | 依計畫名稱查詢（需先呼叫 /api/awards） |
| GET  | `/api/awards/detail/{project_no}` | 依計畫編號取得詳細資訊 |

查詢範例：

```bash
curl "http://localhost:8000/api/awards?pi_name=李文廷"
```

## 回傳資料欄位

```json
{
  "award_year": "113",
  "pi_name": "主持人姓名",
  "organ": "機構名稱",
  "plan_name": "計畫名稱",
  "period": "2024/08/01~2025/07/31",
  "total_amount": "990,000元",
  "impact": "計畫摘要...",
  "keywords_zh": "中文關鍵字",
  "keywords_en": "英文關鍵字",
  "project_no": "113WFA2110082"
}
```

## AWS Serverless 部署（SAM CLI）

### 前置條件

- AWS CLI 已設定 `aws configure`
- SAM CLI 已安裝

### 部署後端（Lambda + API Gateway + S3 + CloudFront）

```bash
sam build --use-container
sam deploy --guided
```

部署完成後，CloudFormation Outputs 會提供：

- `ApiEndpoint`：API Gateway URL
- `FrontendBucketName`：前端 S3 Bucket 名稱
- `FrontendDistributionDomain`：CloudFront 前端網址

### 部署前端（S3 + CloudFront）

1. 設定 API Base URL：

```ini
VITE_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com
```

2. 建置並上傳：

```bash
cd frontend
npm install
npm run build
aws s3 sync dist s3://<FrontendBucketName> --delete
```

3. 使用 CloudFront 網址開啟前端：

```
https://<FrontendDistributionDomain>
```

若更新前端內容，可使用 CloudFront Invalidation：

```bash
aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*"
```

## 注意事項

- 前端 `VITE_API_BASE_URL` 需在 build 前設定，改值後請重新 build
- `/api/awards/{plan_name}` 依賴快取，需要先呼叫 `/api/awards`
- 若要限制 CORS，請在 `template.yaml` 或 FastAPI 設定允許來源
