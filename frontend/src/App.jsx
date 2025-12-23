import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000";
const YEAR_WINDOW = [114, 113, 112, 111, 110];

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
  const [status, setStatus] = useState("輸入主持人姓名開始查詢近五年資料。");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const latestYear = items.reduce((max, item) => {
    const year = Number.parseInt(item.award_year, 10);
    return Number.isFinite(year) ? Math.max(max, year) : max;
  }, 0);

  const yearGroups = YEAR_WINDOW.map((year) => ({ year, items: [] }));
  const yearIndex = new Map(YEAR_WINDOW.map((year, index) => [year, index]));

  items.forEach((item) => {
    const year = Number.parseInt(item.award_year, 10);
    const index = yearIndex.get(year);
    if (index !== undefined) {
      yearGroups[index].items.push(item);
    }
  });

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
    setStatus(`正在查詢「${trimmed}」的研究資料...`);

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
            <p className="brand-subtitle">研究資料蒐集與洞察</p>
          </div>
        </div>
        <div className="status-chip">
          <span className={`dot ${loading ? "pulse" : ""}`} />
          {loading ? "查詢中" : "待命"}
        </div>
      </header>

      <main>
        <section className="hero">
          <form className="search-panel" onSubmit={handleSubmit}>
            <label htmlFor="pi-name">計劃主持人姓名</label>
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
            <div className="search-preview">
              <p className="preview-title">輸出欄位預覽</p>
              <div className="preview-tags">
                <span>計畫名稱</span>
                <span>主持人</span>
                <span>機構</span>
                <span>執行期程</span>
                <span>核定金額</span>
                <span>計畫摘要</span>
                <span>關鍵字</span>
                <span>計畫編號</span>
              </div>
            </div>
          </form>

          <div className="capability-panel">
            <p className="capability-kicker">ResearchCrawler</p>
            <p className="capability-body">
              我們擅長跨來源蒐集、欄位標準化與內容摘要化，讓資料可以被快速檢索、
              比較與應用。輸入姓名即可看到完整資訊與關鍵字整理結果。
            </p>
            <div className="capability-grid">
              <div className="capability-card">
                <span>多來源蒐集</span>
                <p>快速整合不同平台與格式的研究資料。</p>
              </div>
              <div className="capability-card">
                <span>一致欄位</span>
                <p>自動轉換為結構化欄位，便於前端呈現。</p>
              </div>
              <div className="capability-card">
                <span>摘要與關鍵字</span>
                <p>重點整理與關鍵字標註，掌握研究重點。</p>
              </div>
              <div className="capability-card">
                <span>可追溯資料</span>
                <p>保留來源脈絡，方便後續查核與擴充。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="results">
          <div className="results-head">
            <div>
              <h2>查詢結果</h2>
              <p>
                {lastQuery
                  ? `顯示「${lastQuery}」的研究資料（114-110 年度）`
                  : "輸入姓名後即可取得近五年研究資料"}
              </p>
            </div>
            <div className="results-meta">
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
              <div className="year-window">
                {yearGroups.map((group) => (
                  <div
                    key={group.year}
                    className={`year-chip ${
                      group.items.length ? "active" : ""
                    }`}
                  >
                    <span>{group.year} 年度</span>
                    <strong>{group.items.length}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="results-list">
            {!lastQuery && !loading && (
              <div className="empty-state">
                <p>尚無資料顯示，請先輸入主持人姓名。</p>
              </div>
            )}

            {(lastQuery || items.length) &&
              yearGroups.map((group) => (
                <section className="year-block" key={group.year}>
                  <header className="year-head">
                    <h3>{group.year} 年度</h3>
                    <span>{group.items.length} 筆</span>
                  </header>
                  {!group.items.length ? (
                    <div className="empty-year">本年度尚無資料</div>
                  ) : (
                    <div className="year-grid">
                      {group.items.map((item, index) => (
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
                              <div className="tags">
                                {renderTags(item.keywords_zh)}
                              </div>
                            </div>
                            <div className="keyword-block">
                              <span>英文關鍵字</span>
                              <div className="tags">
                                {renderTags(item.keywords_en)}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>ResearchCrawler - 即時查詢研究資料</p>
      </footer>
    </div>
  );
}
