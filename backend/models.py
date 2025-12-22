from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class AwardItem:
    """爬取的獎項資料模型"""

    award_year: str
    pi_name: str
    organ: str
    plan_name: str
    period: str
    total_amount: str
    impact: str
    keywords_zh: str
    keywords_en: str
    project_no: Optional[str] = None

    def to_dict(self):
        """轉換為字典"""
        return asdict(self)

    def to_response(self):
        """轉換為API回應格式"""
        return {
            "award_year": self.award_year,
            "pi_name": self.pi_name,
            "organ": self.organ,
            "plan_name": self.plan_name,
            "period": self.period,
            "total_amount": self.total_amount,
            "impact": self.impact,
            "keywords_zh": self.keywords_zh,
            "keywords_en": self.keywords_en,
            "project_no": self.project_no,
        }
