import { useState } from 'react';
import styles from './Home.module.css';

function Home() {
  const [selectedModel, setSelectedModel] = useState('');
  const [testGoal, setTestGoal] = useState('');
  const [steps, setSteps] = useState<{ id: number; description: string }[]>([]);
  const [newStepDescription, setNewStepDescription] = useState('');
  const [stepCounter, setStepCounter] = useState(1);

  const handleAddStep = () => {
    if (newStepDescription.trim() !== '') {
      setSteps([...steps, { id: stepCounter, description: newStepDescription }]);
      setNewStepDescription('');
      setStepCounter(stepCounter + 1);
    }
  };

  const handleRemoveStep = (stepId: number) => {
    const updatedSteps = steps.filter(step => step.id !== stepId);
    setSteps(updatedSteps);
  };

  const handleRunTest = () => {
    if (!selectedModel) {
      alert('Please select an AI model');
      return;
    }

    if (!testGoal.trim()) {
      alert('Please enter a test goal');
      return;
    }

    if (steps.length === 0) {
      alert('Please add at least one test step');
      return;
    }

    // Implement test execution logic here
    console.log('Running test with:', {
      model: selectedModel,
      goal: testGoal,
      steps: steps.map(step => step.description),
    });

    // Simulate test execution feedback (optional)
    const runButton = document.querySelector(`.${styles.btnRunTest}`) as HTMLButtonElement;
    const originalText = runButton.innerHTML;

    runButton.innerHTML = '<span class="icon">⏳</span>Running Test...'; // You might need to add the icon class in your CSS
    runButton.disabled = true;
    runButton.style.opacity = '0.7';

    setTimeout(() => {
      runButton.innerHTML = '<span class="icon">✅</span>Test Complete!'; // You might need to add the icon class in your CSS

      setTimeout(() => {
        runButton.innerHTML = originalText;
        runButton.disabled = false;
        runButton.style.opacity = '1';
        alert('Test executed successfully!');
      }, 2000);
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <h1>AI Agentic Mobile Tester</h1>

      <div className={styles.formGroup}>
        <label htmlFor="ai-model">Select AI Model:</label>
        <select
          id="ai-model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="">- Select a Model -</option>
          <option value="gpt-4">GPT-4 Turbo</option>
          <option value="claude-3">Claude 3 Sonnet</option>
          <option value="gemini">Gemini Pro</option>
          <option value="llama-2">LLaMA 2</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="test-goal">Test Goal:</label>
        <textarea
          id="test-goal"
          rows={3}
          placeholder="Describe what you want to test..."
          value={testGoal}
          onChange={(e) => setTestGoal(e.target.value)}
        ></textarea>
      </div>

      <div className={styles.testStepsSection}>
        <div className={styles.sectionTitle}>
          <span className="icon">⚡</span>Test Steps:
        </div>

        <div className={styles.addStepForm}>
          <input
            type="text"
            placeholder="Enter step description..."
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddStep();
              }
            }}
          />
          <button className={`${styles.button} ${styles.btnAddStep}`} onClick={handleAddStep}>
            <span className="icon">+ </span>Add Step
          </button>
        </div>

        <div className={styles.stepsContainer}>
          {steps.length === 0 ? (
            <div className={styles.emptyState}>No test steps added yet. Click "Add Step" to begin.</div>
          ) : (
            steps.map((step, index) => (
              <div key={step.id} className={styles.stepItem}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepContent}>{step.description}</div>
                </div>
                <button className={`${styles.button} ${styles.btnDanger}`} onClick={() => handleRemoveStep(step.id)}>
                  <span className="icon">🗑</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.buttonGroup}>

          <button className={`${styles.button} ${styles.btnRunTest}`} onClick={handleRunTest}>
            <span className="icon">▶ </span>Run Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;