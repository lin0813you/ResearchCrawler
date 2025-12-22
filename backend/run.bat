@echo off
REM Windows 啟動腳本

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          NSTC 獎項爬蟲 API 服務啟動                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 檢查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未找到 Python
    echo 請確保已安裝 Python 並添加到 PATH
    pause
    exit /b 1
)

echo ✅ Python 已安裝

REM 檢查依賴
echo.
echo 檢查依賴...
pip list | find "fastapi" >nul
if errorlevel 1 (
    echo ⚠️  未找到依賴，正在安裝...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 安裝失敗
        pause
        exit /b 1
    )
)

echo ✅ 依賴檢查完成

REM 啟動服務
echo.
echo 啟動服務中...
echo 服務地址: http://localhost:8000
echo API 文檔: http://localhost:8000/docs
echo.
echo 按 Ctrl+C 停止服務
echo.

python main.py

pause
