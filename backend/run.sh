#!/bin/bash
# Linux/Mac 啟動腳本

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          NSTC 獎項爬蟲 API 服務啟動                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 錯誤: 未找到 Python"
    echo "請確保已安裝 Python3"
    exit 1
fi

echo "✅ Python 已安裝"

# 檢查依賴
echo ""
echo "檢查依賴..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️  未找到依賴，正在安裝..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ 安裝失敗"
        exit 1
    fi
fi

echo "✅ 依賴檢查完成"

# 啟動服務
echo ""
echo "啟動服務中..."
echo "服務地址: http://localhost:8000"
echo "API 文檔: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服務"
echo ""

python3 main.py
