import { useEffect, useMemo, useRef, useState } from "react";

const sampleProjects = [
  {
    title: "Adaptive Robotics for Smart Manufacturing",
    agency: "MOST",
    year: 2024,
    duration: "2024-2026",
    amount: 8.4,
    field: "Robotics",
    summary: "Autonomous control and sensing for flexible production lines.",
  },
  {
    title: "Trustworthy AI for Medical Imaging",
    agency: "NSC",
    year: 2022,
    duration: "2022-2025",
    amount: 12.1,
    field: "AI",
    summary: "Model validation and explainability for clinical deployment.",
  },
  {
    title: "Next-Gen Battery Materials",
    agency: "MOST",
    year: 2019,
    duration: "2019-2022",
    amount: 6.3,
    field: "Energy",
    summary: "High-density cathode materials with improved stability.",
  },
  {
    title: "Sustainable Water Treatment Systems",
    agency: "NSC",
    year: 2016,
    duration: "2016-2018",
    amount: 5.1,
    field: "Environment",
    summary: "Low-energy purification for municipal infrastructure.",
  },
];

function formatMoney(amount) {
  return `NTD ${amount.toFixed(1)}M`;
}

function ResultCard({ project }) {
  return (
    <article className="result-card">
      <h3>{project.title}</h3>
      <div className="result-meta">
        <span>Agency: {project.agency}</span>
        <span>Year: {project.year}</span>
        <span>Duration: {project.duration}</span>
        <span>Budget: {formatMoney(project.amount)}</span>
      </div>
      <p>{project.summary}</p>
      <div className="result-tags">
        <span className="tag">{project.field}</span>
      </div>
    </article>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Ready to query the crawler.");
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef(null);

  const { currentYear, cutoffYear } = useMemo(() => {
    const now = new Date().getFullYear();
    return { currentYear: now, cutoffYear: now - 9 };
  }, []);

  const projects = useMemo(() => {
    if (!query) {
      return [];
    }
    return sampleProjects
      .filter((project) => project.year >= cutoffYear)
      .sort((a, b) => b.year - a.year);
  }, [query, cutoffYear]);

  const stats = useMemo(() => {
    if (!query || !projects.length) {
      return {
        count: "-",
        total: "-",
        mostRecent: "-",
      };
    }

    const totalBudget = projects.reduce((sum, project) => sum + project.amount, 0);
    return {
      count: `${projects.length}`,
      total: formatMoney(totalBudget),
      mostRecent: `${projects[0].year}`,
    };
  }, [projects, query]);

  const resultsTitle = query ? `Results for ${query}` : "Latest results";
  const resultsSubtitle = query
    ? projects.length
      ? `Showing ${projects.length} projects from ${cutoffYear}-${currentYear}.`
      : "No projects found in the last 10 years."
    : "Enter a name to generate a 10-year project timeline.";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();

    setIsSearching(true);
    setStatus("Searching NSC and MOST records...");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setQuery(trimmed);
      setStatus(trimmed ? `Showing results for ${trimmed}.` : "Ready to query the crawler.");
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">RC</span>
          <div>
            <p className="brand-title">ResearchCrawler</p>
            <p className="brand-subtitle">NSC and MOST project intelligence</p>
          </div>
        </div>
        <nav className="nav">
          <a href="#how" className="nav-link">
            How it works
          </a>
          <a href="#results" className="nav-link">
            Results
          </a>
          <a href="#roadmap" className="nav-link">
            Roadmap
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Track funded research in one search.</p>
            <h1>Find faculty projects from the last 10 years.</h1>
            <p className="hero-body">
              Enter a professor name and surface NSC and MOST awards, aligned, cleaned,
              and ready to review in one timeline.
            </p>
            <div className="hero-metrics">
              <div className="metric">
                <p className="metric-value">10 years</p>
                <p className="metric-label">Coverage window</p>
              </div>
              <div className="metric">
                <p className="metric-value">NSC + MOST</p>
                <p className="metric-label">Data sources</p>
              </div>
              <div className="metric">
                <p className="metric-value">Crawler</p>
                <p className="metric-label">Automated updates</p>
              </div>
            </div>
          </div>

          <div className="search-card">
            <form className="search-form" onSubmit={handleSubmit}>
              <label className="search-label" htmlFor="professor-name">
                Professor name
              </label>
              <input
                id="professor-name"
                name="professor"
                type="text"
                placeholder="e.g., Li Wei, Chen Yu"
                autoComplete="off"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search projects"}
              </button>
              <p className="search-hint">Results show only awards within the last 10 years.</p>
            </form>
            <div className="search-status">{status}</div>
          </div>
        </section>

        <section id="how" className="how">
          <div>
            <h2>How it works</h2>
            <p>
              The crawler scans NSC and MOST listings, normalizes titles, and groups
              awards by faculty name for a clean timeline.
            </p>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <p className="how-step">01</p>
              <h3>Identify sources</h3>
              <p>Index project lists and award records from public releases.</p>
            </div>
            <div className="how-card">
              <p className="how-step">02</p>
              <h3>Clean and align</h3>
              <p>Normalize names, dates, and funding amounts into one schema.</p>
            </div>
            <div className="how-card">
              <p className="how-step">03</p>
              <h3>Render timeline</h3>
              <p>Display results by year with summaries and source labels.</p>
            </div>
          </div>
        </section>

        <section id="results" className="results">
          <div className="results-head">
            <div>
              <h2>{resultsTitle}</h2>
              <p>{resultsSubtitle}</p>
            </div>
            <div className="results-stats">
              <div className="stat">
                <p className="stat-label">Projects</p>
                <p className="stat-value">{stats.count}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Total budget</p>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Most recent</p>
                <p className="stat-value">{stats.mostRecent}</p>
              </div>
            </div>
          </div>

          <div className="results-list">
            {!query && (
              <div className="empty-state">
                <p>Please enter a name to search.</p>
              </div>
            )}
            {query && !projects.length && (
              <div className="empty-state">
                <p>No projects found.</p>
              </div>
            )}
            {projects.map((project) => (
              <ResultCard key={`${project.title}-${project.year}`} project={project} />
            ))}
          </div>
        </section>

        <section id="roadmap" className="roadmap">
          <div className="roadmap-copy">
            <h2>Product roadmap</h2>
            <p>
              Build toward a rich research profile with filtering, exports, and alerts
              when new awards appear.
            </p>
            <div className="roadmap-tags">
              <span>Alerts</span>
              <span>CSV export</span>
              <span>Name disambiguation</span>
            </div>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-year">Phase 1</div>
              <p>Single search interface and 10-year project list.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">Phase 2</div>
              <p>Filters by field, funding type, and institution.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">Phase 3</div>
              <p>Automated updates, sharing, and exported reports.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>ResearchCrawler prototype for faculty project discovery.</p>
      </footer>
    </div>
  );
}
