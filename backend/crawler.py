import re
import ssl
from typing import Optional, List
from urllib.parse import urljoin

import requests
from requests.adapters import HTTPAdapter
from bs4 import BeautifulSoup

from models import AwardItem


BASE = "https://wsts.nstc.gov.tw/STSWeb/Award/"
LIST_ENDPOINT = urljoin(BASE, "AwardMultiQuery.aspx")
IMPACT_DETAIL_ENDPOINT = urljoin(BASE, "AwardDialog3.aspx")


class TLS12Adapter(HTTPAdapter):
    """自訂HTTPS適配器，強制使用TLS 1.2"""

    def __init__(self) -> None:
        ctx = ssl.create_default_context()
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        ctx.maximum_version = ssl.TLSVersion.TLSv1_2
        ctx.set_ciphers("DEFAULT:@SECLEVEL=1")
        if hasattr(ssl, "VERIFY_X509_STRICT"):
            ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
        self._ssl_context = ctx
        super().__init__()

    def init_poolmanager(self, connections, maxsize, block=False, **pool_kwargs):
        pool_kwargs["ssl_context"] = self._ssl_context
        return super().init_poolmanager(
            connections, maxsize, block=block, **pool_kwargs
        )

    def proxy_manager_for(self, proxy, **proxy_kwargs):
        proxy_kwargs["ssl_context"] = self._ssl_context
        return super().proxy_manager_for(proxy, **proxy_kwargs)


class NSTCAwardClient:
    """NSTC獎項查詢客戶端"""

    def __init__(self, timeout: int = 30):
        self.s = requests.Session()
        self.s.mount("https://", TLS12Adapter())
        self.s.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
                "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
            }
        )
        self.timeout = timeout

    def search_awards(
        self, *, year: int, code: str, name: str, organ: str = ""
    ) -> List[AwardItem]:
        """
        查詢符合條件的獎項資料

        Args:
            year: 民國年份 (e.g., 113, 112)
            code: 獎項代碼 (e.g., QS01)
            name: 主持人姓名（可中文）
            organ: 機構名稱（可選）

        Returns:
            AwardItem列表
        """
        params = {
            "year": str(year),
            "code": code,
            "organ": organ,
            "name": name,
        }
        r = self.s.get(LIST_ENDPOINT, params=params, timeout=self.timeout)
        r.raise_for_status()

        soup = BeautifulSoup(r.text, "lxml")
        grid = soup.select_one("#wUctlAwardQueryPage_grdResult")
        if not grid:
            return []

        items: List[AwardItem] = []
        for tr in grid.select("tr.Grid_Row"):
            tds = tr.find_all("td", recursive=False)
            if len(tds) < 4:
                continue

            award_year = tds[0].get_text(strip=True)
            pi_name = tds[1].get_text(strip=True)
            organ_text = tds[2].get_text(strip=True)
            content_td = tds[3]

            def span_by_id_contains(key: str) -> str:
                sp = content_td.find("span", id=re.compile(re.escape(key)))
                return sp.get_text(strip=True) if sp else ""

            plan_name = span_by_id_contains("lblAWARD_PLAN_CHI_DESCc_")
            period = span_by_id_contains("lblAWARD_ST_ENDc_")
            total_amount = span_by_id_contains("lblAWARD_TOT_AUD_AMTc_")
            impact_preview = span_by_id_contains("lblIMPACT_Sc_")
            keywords_zh = span_by_id_contains("lblKEYS_CHIc_")
            keywords_en = span_by_id_contains("lblKEYS_ENGc_")

            project_no = self._extract_project_no(content_td)

            impact_full = impact_preview
            if project_no and self._has_impact_detail_link(content_td):
                full = self.fetch_impact_detail(project_no)
                if full:
                    impact_full = full

            items.append(
                AwardItem(
                    award_year=award_year,
                    pi_name=pi_name,
                    organ=organ_text,
                    plan_name=plan_name,
                    period=period,
                    total_amount=total_amount,
                    impact=impact_full,
                    keywords_zh=keywords_zh,
                    keywords_en=keywords_en,
                    project_no=project_no,
                )
            )

        return items

    def fetch_impact_detail(self, project_no: str) -> str:
        """
        獲取計畫概述的完整版本

        Args:
            project_no: 計畫編號 (e.g., 113WFA2110082)

        Returns:
            計畫概述完整文本
        """
        r = self.s.get(
            IMPACT_DETAIL_ENDPOINT, params={"no": project_no}, timeout=self.timeout
        )
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")

        # 優先嘗試常見的ID
        for pat in [r"lblIMPACT", r"IMPACT_S", r"Impact", r"impact"]:
            node = soup.find(id=re.compile(pat))
            if node:
                text = node.get_text(" ", strip=True)
                if text:
                    return text

        # fallback：找最像「內文」的td/div（文字最多的那個）
        candidates = soup.find_all(["td", "div"])
        best = ""
        for c in candidates:
            text = c.get_text(" ", strip=True)
            if len(text) > len(best):
                best = text

        best = re.sub(r"\s+", " ", best).strip()
        return best

    @staticmethod
    def _has_impact_detail_link(content_td) -> bool:
        a = content_td.find("a", id=re.compile(r"lnkZIMPACT_S_"))
        return a is not None

    @staticmethod
    def _extract_project_no(content_td) -> Optional[str]:
        """
        從onclick屬性中提取計畫編號

        Returns:
            計畫編號 (e.g., 113WFA2110082)
        """
        onclick_nodes = content_td.find_all(["a", "input"])
        for node in onclick_nodes:
            onclick = node.get("onclick") or ""
            m = re.search(
                r"(?:AwardDialog3\.aspx\?no=|AwardDialog\.aspx\?year=\d+&sys=[^&]+&no=)([A-Za-z0-9]+)",
                onclick,
            )
            if m:
                return m.group(1)
        return None
