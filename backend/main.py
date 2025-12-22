from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict

from crawler import NSTCAwardClient
from models import AwardItem

app = FastAPI(
    title="Research Crawler API", description="NSTC獎項資料爬蟲API", version="1.0.0"
)

# CORS中間件配置（允許前端跨域請求）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發環境允許所有來源，生產環境應改為具體的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化爬蟲客戶端
crawler_client = NSTCAwardClient()

# 快取：存儲已爬取的數據，key為plan_name
awards_cache: Dict[str, List[dict]] = {}


@app.get("/api/health")
async def health_check():
    """健康檢查端點"""
    return {"status": "healthy"}


@app.get("/api/awards", response_model=List[dict])
async def search_awards(
    year: int = Query(..., description="民國年份，例如113"),
    code: str = Query(..., description="獎項代碼，例如QS01"),
    name: str = Query(..., description="主持人姓名"),
    organ: str = Query("", description="機構名稱（可選）"),
):
    """
    查詢獎項資料

    查詢參數:
    - year: 民國年份 (e.g., 113)
    - code: 獎項代碼 (e.g., QS01)
    - name: 主持人姓名
    - organ: 機構名稱 (可選)

    範例: GET /api/awards?year=113&code=QS01&name=李文廷
    """
    try:
        awards = crawler_client.search_awards(
            year=year, code=code, name=name, organ=organ
        )
        if not awards:
            raise HTTPException(status_code=404, detail="未找到符合條件的獎項資料")

        # 將結果存入快取，以便後續通過plan_name直接查詢
        result_list = []
        for award in awards:
            award_dict = award.to_response()
            result_list.append(award_dict)

            # 按plan_name建立快取索引
            if award.plan_name not in awards_cache:
                awards_cache[award.plan_name] = []
            awards_cache[award.plan_name].append(award_dict)

        return result_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查詢失敗: {str(e)}")


@app.get("/api/awards/{plan_name}", response_model=List[dict])
async def search_awards_by_plan_name(
    plan_name: str = Path(..., description="計畫名稱"),
):
    """
    根據計畫名稱查詢獎項資料

    路由參數:
    - plan_name: 計畫名稱（URL編碼）

    範例: GET /api/awards/計畫名稱

    說明：從快取中查詢，需要先使用 /api/awards 端點進行查詢以填充快取
    """
    if plan_name not in awards_cache:
        raise HTTPException(
            status_code=404,
            detail=f"未找到計畫名稱 '{plan_name}' 的數據。請先使用 /api/awards 端點查詢以填充快取。",
        )
    return awards_cache[plan_name]


@app.get("/api/awards/detail/{project_no}", response_model=dict)
async def get_impact_detail(project_no: str):
    """
    獲取特定計畫編號的詳細信息

    路由參數:
    - project_no: 計畫編號 (e.g., 113WFA2110082)

    範例: GET /api/awards/detail/113WFA2110082
    """
    try:
        impact = crawler_client.fetch_impact_detail(project_no)
        if not impact:
            raise HTTPException(
                status_code=404, detail=f"未找到計畫編號 {project_no} 的詳細信息"
            )
        return {"project_no": project_no, "impact": impact}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取詳細信息失敗: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
