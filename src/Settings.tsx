import React, { useState, useEffect } from 'react';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedModel = localStorage.getItem('selectedAIModel');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    localStorage.setItem('selectedAIModel', newModel);
    setSuccessMessage('AI model selection saved!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      
      <div className={styles.formGroup}>
        <label htmlFor="ai-model">Select Default AI Model:</label>
        <select
          id="ai-model"
          value={selectedModel}
          onChange={handleModelChange}
        >
          <option value="">- Select a Model -</option>
          <option value="gpt_4">Open Router GPT-4</option>
          <option value="gwen_3">Ollama Gwen 3.0 6B</option>
          <option value="gemini">Gemini 2.0 Flash</option>
          <option value="llama_3_2">Ollama LLaMA 3.2 3B</option>
        </select>
        {successMessage && (
          <div className={styles.successMessage} style={{ color: 'green', marginTop: '10px' }}>
            {successMessage}
          </div>
        )}
      </div>

      <p>The selected model will be used for running all test scenarios.</p>
    </div>
  );
};

export default Settings;
