# AWS 服務說明

本文件說明本專案實際使用的 AWS 服務。

## API / 後端

- **AWS Lambda**
  - 執行 FastAPI 後端（透過 Mangum）
  - 提供 `/api/health`、`/api/awards` 等 API 端點

- **Amazon API Gateway (HTTP API)**
  - 對外提供 HTTP 入口
  - 將 `/api/*` 請求轉送給 Lambda

## 前端

- **Amazon S3 (Static Website Hosting)**
  - 儲存前端 build 後的靜態檔案
  - 提供靜態網站入口

- **Amazon CloudFront**
  - 作為前端 CDN
  - 加速靜態資源並提供 HTTPS

## 監控與記錄

- **Amazon CloudWatch**
  - 收集 Lambda 執行記錄與錯誤日誌
