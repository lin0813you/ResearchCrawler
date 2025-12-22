import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";

function formatValue(value) {
  if (value === null || value === undefined) {
    return "—";
  }
  const text = String(value).trim();
  return text ? text : "—";
}

function splitKeywords(value) {
  return String(value || "")
    .split(/[,;；、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function App() {
  const [piName, setPiName] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("輸入主持人姓名開始查詢。");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const latestYear = items.reduce((max, item) => {
    const year = Number.parseInt(item.award_year, 10);
    return Number.isFinite(year) ? Math.max(max, year) : max;
  }, 0);

  const latestYearLabel = latestYear ? String(latestYear) : "-";
  const projectNoLabel =
    items.find((item) => item.project_no)?.project_no || "-";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = piName.trim();
    if (!trimmed) {
      setError("請輸入主持人姓名。");
      setItems([]);
      setStatus("尚未查詢");
      return;
    }

    setLastQuery(trimmed);
    setLoading(true);
    setError("");
    setStatus(`正在查詢「${trimmed}」的獎項資料...`);

    try {
      const response = await fetch(
        `${API_BASE}/api/awards?pi_name=${encodeURIComponent(trimmed)}`
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const detail =
          payload && typeof payload === "object" && "detail" in payload
            ? payload.detail
            : "查詢失敗，請稍後再試。";
        throw new Error(detail);
      }

      const list = Array.isArray(payload) ? payload : [];
      setItems(list);
      setStatus(list.length ? `找到 ${list.length} 筆資料` : "沒有符合的資料");
    } catch (err) {
      setItems([]);
      setError(err?.message || "查詢失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const renderTags = (value) => {
    const tags = splitKeywords(value);
    if (!tags.length) {
      return <span className="tag muted">無</span>;
    }
    return tags.map((tag, index) => (
      <span className="tag" key={`${tag}-${index}`}>
        {tag}
      </span>
    ));
  };

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">RC</span>
          <div className="brand-copy">
            <p className="brand-title">ResearchCrawler</p>
            <p className="brand-subtitle">NSTC 獎項資料搜尋</p>
          </div>
        </div>
        <div className="status-chip">
          <span className={`dot ${loading ? "pulse" : ""}`} />
          {loading ? "查詢中" : "待命"}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Research Awards Insight</p>
            <h1>輸入主持人姓名，立即整理獎項資料</h1>
            <p className="hero-body">
              前端只需回傳 pi_name，後端即時爬取與清洗資料。以下結果包含
              計畫資訊、金額、摘要與關鍵字，讓你快速完成前端呈現。
            </p>
            <div className="hero-badges">
              <span>即時爬蟲</span>
              <span>中文欄位</span>
              <span>一致格式</span>
            </div>
          </div>

          <form className="search-panel" onSubmit={handleSubmit}>
            <label htmlFor="pi-name">主持人姓名 (pi_name)</label>
            <div className="input-row">
              <input
                id="pi-name"
                name="pi_name"
                type="text"
                placeholder="例如：李文廷"
                autoComplete="off"
                value={piName}
                onChange={(event) => setPiName(event.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "查詢中..." : "開始查詢"}
              </button>
            </div>
            <p className="helper">資料來源：NSTC 公開獎項資料</p>
            <div className={`status-bar ${error ? "error" : ""}`}>
              {error || status}
            </div>
          </form>
        </section>

        <section className="results">
          <div className="results-head">
            <div>
              <h2>查詢結果</h2>
              <p>
                {lastQuery
                  ? `顯示「${lastQuery}」的獎項資料`
                  : "輸入姓名後即可取得獎項資料"}
              </p>
            </div>
            <div className="results-metrics">
              <div className="metric">
                <span>資料筆數</span>
                <strong>{items.length || "-"}</strong>
              </div>
              <div className="metric">
                <span>最新年度</span>
                <strong>{latestYearLabel}</strong>
              </div>
              <div className="metric">
                <span>計畫編號</span>
                <strong>{projectNoLabel}</strong>
              </div>
            </div>
          </div>

          <div className="results-list">
            {!items.length && !loading && (
              <div className="empty-state">
                <p>尚無資料顯示，請先輸入主持人姓名。</p>
              </div>
            )}

            {items.map((item, index) => (
              <article
                className="result-card"
                key={`${item.project_no || item.plan_name || index}`}
                style={{ "--delay": `${index * 0.05}s` }}
              >
                <div className="card-head">
                  <div>
                    <p className="label">計畫名稱</p>
                    <h3>{formatValue(item.plan_name)}</h3>
                  </div>
                  <div className="pill">
                    計畫編號 {formatValue(item.project_no)}
                  </div>
                </div>

                <div className="card-grid">
                  <div className="field">
                    <span>獲獎年份</span>
                    <strong>{formatValue(item.award_year)}</strong>
                  </div>
                  <div className="field">
                    <span>主持人</span>
                    <strong>{formatValue(item.pi_name)}</strong>
                  </div>
                  <div className="field">
                    <span>機構</span>
                    <strong>{formatValue(item.organ)}</strong>
                  </div>
                  <div className="field">
                    <span>執行期程</span>
                    <strong>{formatValue(item.period)}</strong>
                  </div>
                  <div className="field">
                    <span>核定金額</span>
                    <strong>{formatValue(item.total_amount)}</strong>
                  </div>
                </div>

                <div className="card-section">
                  <p className="section-title">計畫摘要</p>
                  <p className="impact">{formatValue(item.impact)}</p>
                </div>

                <div className="card-footer">
                  <div className="keyword-block">
                    <span>中文關鍵字</span>
                    <div className="tags">{renderTags(item.keywords_zh)}</div>
                  </div>
                  <div className="keyword-block">
                    <span>英文關鍵字</span>
                    <div className="tags">{renderTags(item.keywords_en)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>ResearchCrawler 前端展示 - 即時查詢 NSTC 獎項資料</p>
      </footer>
    </div>
  );
}
