"""
測試腳本：演示如何調用後端 API
"""

import requests
import json


BASE_URL = "http://localhost:8000"


def test_health_check():
    """測試健康檢查端點"""
    print("=" * 60)
    print("測試: 健康檢查")
    print("=" * 60)

    response = requests.get(f"{BASE_URL}/api/health")
    print(f"狀態碼: {response.status_code}")
    print(f"回應: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
    print()


def test_search_awards():
    """測試查詢獎項資料"""
    print("=" * 60)
    print("測試: 查詢獎項資料")
    print("=" * 60)

    params = {
        "year": 113,
        "code": "QS01",
        "name": "李文廷",
    }

    print(f"查詢參數: {params}")
    response = requests.get(f"{BASE_URL}/api/awards", params=params)

    print(f"狀態碼: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"找到 {len(data)} 筆記錄")

        if data:
            print("\n第一筆記錄:")
            print(json.dumps(data[0], ensure_ascii=False, indent=2))

            # 儲存 plan_name 供後續測試使用
            return data[0].get("plan_name"), data[0].get("project_no")
    else:
        print(f"錯誤: {response.json()}")

    print()
    return None, None


def test_search_by_plan_name(plan_name):
    """測試根據計畫名稱查詢"""
    if not plan_name:
        print("⚠️  跳過: 沒有計畫名稱")
        return

    print("=" * 60)
    print(f"測試: 根據計畫名稱查詢")
    print("=" * 60)
    print(f"計畫名稱: {plan_name}")

    # URL 編碼計畫名稱
    url = f"{BASE_URL}/api/awards/{plan_name}"
    response = requests.get(url)

    print(f"狀態碼: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"找到 {len(data)} 筆記錄")
        if data:
            print("\n記錄:")
            print(json.dumps(data[0], ensure_ascii=False, indent=2))
    else:
        print(f"錯誤: {response.json()}")

    print()


def test_detail(project_no):
    """測試獲取計畫詳細信息"""
    if not project_no:
        print("⚠️  跳過: 沒有計畫編號")
        return

    print("=" * 60)
    print(f"測試: 獲取計畫詳細信息")
    print("=" * 60)
    print(f"計畫編號: {project_no}")

    response = requests.get(f"{BASE_URL}/api/awards/detail/{project_no}")

    print(f"狀態碼: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("\n回應:")
        # 如果內容太長，只顯示前 500 個字符
        impact = data.get("impact", "")
        if len(impact) > 500:
            print(
                json.dumps(
                    {
                        "project_no": data.get("project_no"),
                        "impact": impact[:500] + "...",
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
        else:
            print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(f"錯誤: {response.json()}")

    print()


def main():
    """運行所有測試"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "NSTC 獎項爬蟲 API 測試" + " " * 26 + "║")
    print("╚" + "=" * 58 + "╝")
    print()

    try:
        # 1. 測試健康檢查
        test_health_check()

        # 2. 測試查詢獎項
        plan_name, project_no = test_search_awards()

        # 3. 測試根據計畫名稱查詢
        test_search_by_plan_name(plan_name)

        # 4. 測試獲取詳細信息
        test_detail(project_no)

        print("✅ 所有測試完成！")

    except requests.exceptions.ConnectionError:
        print("❌ 錯誤: 無法連接到服務器")
        print("   請確保服務器運行在 http://localhost:8000")
        print("\n   啟動服務器:")
        print("   cd backend")
        print("   python main.py")
    except Exception as e:
        print(f"❌ 發生錯誤: {e}")


if __name__ == "__main__":
    main()
