import React from 'react';
import mermaid from 'mermaid';
import styles from './About.module.css';
import homeStyles from '../home/Home.module.css';

const About: React.FC = () => {
  React.useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme:
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'default',
    });
    mermaid.run();
  }, []);

  return (
    <div className={styles.container}>
      <h1>About</h1>
      <p className={styles.lead}>
        The <strong>AI Agentic Mobile Tester Agent</strong> automates Android application testing with{' '}
        <strong>AI-powered agents</strong>.
      </p>

      <div className={homeStyles.mainLayout}>
        {/* Left Column: Project Cards */}
        <div className={homeStyles.leftPanel}>
          <div className={homeStyles.panelTitle}>
            <span className="icon">📦</span> Components
          </div>
          <div>
            <article className={styles.card}>
              <h3>🖥️ Frontend Dashboard</h3>
              <p>
                Define scenarios, configure agent parameters, trigger runs, and view
                reports.
              </p>
              <div className={styles.btns}>
                <a
                  className={`${homeStyles.btnAddStep} ${homeStyles.button}`}
                  href="https://github.com/maikotrindade/mobile-tester-agent-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Repo
                </a>
              </div>
            </article>

            <article className={styles.card}>
              <h3>⚙️ Backend AI Agent</h3>
              <p>
                Built with <code className={styles.inline}>Koog</code> +{' '}
                <code className={styles.inline}>Ktor</code>. Uses LLMs to
                interpret steps, executes actions via <code className={styles.inline}>ADB</code> and generates reports.
              </p>
              <div className={styles.btns}>
                <a
                  className={`${homeStyles.btnAddStep} ${homeStyles.button}`}
                  href="https://github.com/maikotrindade/mobile-tester-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Repo
                </a>
              </div>
            </article>

            <article className={styles.card}>
              <h3>📱 Sample Android App</h3>
              <p>
                Lightweight demo app used for automated UI tests to showcase end-to-end flows.
              </p>
              <div className={styles.btns}>
                <a
                  className={`${homeStyles.btnAddStep} ${homeStyles.button}`}
                  href="https://github.com/maikotrindade/mobile-tester-agent-sample-app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Repo
                </a>
              </div>
            </article>
          </div>
        </div>

        {/* Right Column: System Overview Diagram */}
        <div className={homeStyles.rightPanel}>
          <div className={homeStyles.panelTitle}>
            <span className="icon">🗺️</span> System Overview
          </div>
          <section className={styles.diagram} aria-label="System overview diagram">
            <div className="mermaid">
              {`
graph TD
    A[Frontend] --> B[Backend API]
    B --> C[Koog Agent]
    C --> D[ADB]
    D --> E[Android Device]
    E --> F[Sample App]
    C --> G[LLM]
    C --> H[Reports]
    H --> A
`}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default About;
