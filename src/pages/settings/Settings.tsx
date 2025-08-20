import React, { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import homeStyles from '../home/Home.module.css';

const Settings: React.FC = () => {
  const [executorInfoId, setExecutorInfoId] = useState<string>('');
  const [llmTemperature, setLlmTemperature] = useState<number>(0.2);
  const [maxAgentIterations, setMaxAgentIterations] = useState<number>(50);
  const [logTokensConsumption, setLogTokensConsumption] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedExecutorInfoId = localStorage.getItem('executorInfoId');
    if (savedExecutorInfoId) {
      setExecutorInfoId(savedExecutorInfoId);
    }
    const savedLlmTemperature = localStorage.getItem('llmTemperature');
    if (savedLlmTemperature) {
      setLlmTemperature(parseFloat(savedLlmTemperature));
    }
    const savedMaxAgentIterations = localStorage.getItem('maxAgentIterations');
    if (savedMaxAgentIterations) {
      setMaxAgentIterations(parseInt(savedMaxAgentIterations, 10));
    }
    const savedLogTokensConsumption = localStorage.getItem('logTokensConsumption');
    if (savedLogTokensConsumption) {
      setLogTokensConsumption(savedLogTokensConsumption === 'true');
    }
  }, []);

  const handleSave = async () => {
    const settings = {
      executorInfoId,
      llmTemperature,
      maxAgentIterations,
      logTokensConsumption,
    };

    // Save to localStorage
    localStorage.setItem('executorInfoId', executorInfoId);
    localStorage.setItem('llmTemperature', llmTemperature.toString());
    localStorage.setItem('maxAgentIterations', maxAgentIterations.toString());
    localStorage.setItem('logTokensConsumption', logTokensConsumption.toString());

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccessMessage('Settings saved successfully!');
      } else {
        setSuccessMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSuccessMessage('An error occurred while saving settings.');
    }

    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      
      <div className={homeStyles.mainLayout}>
        {/* Left Panel - Model Configuration */}
        <div className={homeStyles.leftPanel}>
          <div className={homeStyles.panelTitle}>
            <span className="icon">🤖</span>AI Model Configuration
          </div>
          
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="ai-model">Select Default AI Model:</label>
              <select
                id="ai-model"
                value={executorInfoId}
                onChange={(e) => setExecutorInfoId(e.target.value)}
              >
                <option value="">- Select a Model -</option>
                <option value="open_router">Open Router GPT-4</option>
                <option value="ollama_gwen">Ollama Gwen 3.0 6B</option>
                <option value="gemini">Gemini 2.0 Flash</option>
                <option value="ollama_llama">Ollama LLaMA 3.2 3B</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="llm-temperature">LLM Temperature: {llmTemperature}</label>
              <input
                type="range"
                id="llm-temperature"
                min="0"
                max="10"
                step="0.2"
                value={llmTemperature}
                onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
              />
              <div className={styles.temperatureInfo}>
                <small>Controls randomness in AI responses (0 = deterministic, 10 = very creative)</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Agent Configuration */}
        <div className={homeStyles.rightPanel}>
          <div className={homeStyles.panelTitle}>
            <span className="icon">⚙️</span>Agent Configuration
          </div>
          
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="max-agent-iterations">Max Agent Iterations:</label>
              <input
                type="number"
                id="max-agent-iterations"
                value={maxAgentIterations}
                onChange={(e) => setMaxAgentIterations(parseInt(e.target.value, 10))}
                min="1"
                max="200"
              />
              <div className={styles.iterationInfo}>
                <small>Maximum number of steps the agent can take to complete a task</small>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={logTokensConsumption}
                  onChange={(e) => setLogTokensConsumption(e.target.checked)}
                />
                Log Tokens Consumption
              </label>
              <div className={styles.tokenInfo}>
                <small>Enable detailed logging of API token usage for cost tracking</small>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button 
                onClick={handleSave} 
                className={styles.saveButton}
                disabled={!executorInfoId}
              >
                Save Settings
              </button>
            </div>

            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
