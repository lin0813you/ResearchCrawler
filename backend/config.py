# 後端 API 配置檔案範例

# 服務器配置
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000
DEBUG = True

# 爬蟲配置
CRAWLER_TIMEOUT = 30  # 秒
CRAWLER_RETRY = 3  # 重試次數

# CORS 配置
CORS_ORIGINS = ["*"]  # 生產環境應設置為具體的前端域名
# CORS_ORIGINS = ["http://localhost:5173", "https://yourdomain.com"]

# 快取配置
CACHE_TTL = 3600  # 快取過期時間（秒）
MAX_CACHE_SIZE = 1000  # 最大快取記錄數

# 日誌配置
LOG_LEVEL = "INFO"
LOG_FILE = "logs/crawler.log"
