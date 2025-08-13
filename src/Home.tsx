import { useState } from 'react';
import axios from 'axios';
import styles from './Home.module.css';

interface TestScenario {
  id: string;
  name: string;
  model: string;
  goal: string;
  steps: { id: number; description: string }[];
  createdAt: Date;
  updatedAt: Date;
}

function Home() {
  const [selectedModel, setSelectedModel] = useState('');
  const [testGoal, setTestGoal] = useState('');
  const [steps, setSteps] = useState<{ id: number; description: string }[]>([]);
  const [newStepDescription, setNewStepDescription] = useState('');
  const [stepCounter, setStepCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for scenario management
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  // Scenario management functions
  const generateScenarioId = () => {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      setError('Please enter a scenario name');
      return;
    }

    if (!selectedModel || !testGoal.trim() || steps.length === 0) {
      setError('Please complete all fields before saving');
      return;
    }

    const now = new Date();
    
    if (currentScenarioId) {
      // Update existing scenario
      setScenarios(prev => prev.map(scenario => 
        scenario.id === currentScenarioId 
          ? {
              ...scenario,
              name: scenarioName,
              model: selectedModel,
              goal: testGoal,
              steps: [...steps],
              updatedAt: now
            }
          : scenario
      ));
    } else {
      // Create new scenario
      const newScenario: TestScenario = {
        id: generateScenarioId(),
        name: scenarioName,
        model: selectedModel,
        goal: testGoal,
        steps: [...steps],
        createdAt: now,
        updatedAt: now
      };
      
      setScenarios(prev => [...prev, newScenario]);
      setCurrentScenarioId(newScenario.id);
    }

    setShowSaveDialog(false);
    setError(null);
  };

  const handleLoadScenario = (scenario: TestScenario) => {
    setSelectedModel(scenario.model);
    setTestGoal(scenario.goal);
    setSteps([...scenario.steps]);
    setScenarioName(scenario.name);
    setCurrentScenarioId(scenario.id);
    
    // Update step counter to be higher than any existing step
    const maxStepId = scenario.steps.length > 0 ? Math.max(...scenario.steps.map(s => s.id)) : 0;
    setStepCounter(maxStepId + 1);
    
    setError(null);
  };

  const handleNewScenario = () => {
    setSelectedModel('');
    setTestGoal('');
    setSteps([]);
    setScenarioName('');
    setCurrentScenarioId(null);
    setStepCounter(1);
    setError(null);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    
    if (currentScenarioId === scenarioId) {
      handleNewScenario();
    }
  };

  const openSaveDialog = () => {
    if (!selectedModel || !testGoal.trim() || steps.length === 0) {
      setError('Please complete all fields before saving');
      return;
    }
    setShowSaveDialog(true);
    setError(null);
  };

  const handleRunTest = async () => {
    if (!selectedModel) {
      setError('Please select an AI model');
      return;
    }

    if (!testGoal.trim()) {
      setError('Please enter a test goal');
      return;
    }

    if (steps.length === 0) {
      setError('Please add at least one test step');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        model: selectedModel,
        goal: testGoal,
        steps: steps.map(step => step.description),
      };

      console.log('Sending request to backend:', payload);

      let url = '';
      switch (selectedModel) {
        case 'gpt_4':
          url = "/api/openRouter/gpt_4";
          break;
        case 'gwen_3':
          url = "/api/ollama/gwen_3_06B";
          break;
        case 'gemini':
          url = "/api/gemini_2_0Flash";
          break;
        case 'llama_3_2':
          url = "/api/ollama/llama_3_2_3B";
          break;
        default:
          throw new Error('Invalid model selected');
      }
      
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
        withCredentials: false, // Explicitly disable credentials for CORS
      });

      console.log('Test execution response:', response.data);
      alert('Test executed successfully!');
    } catch (err) {
      console.error('Test execution failed:', err);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check if the backend server is running on http://localhost:8080';
        } else if (err.response) {
          // Server responded with error status
          const responseData = err.response.data;
          const statusText = err.response.statusText;
          const status = err.response.status;
          
          if (responseData) {
            if (typeof responseData === 'string') {
              errorMessage = `Server error (${status}): ${responseData}`;
            } else if (responseData.message) {
              errorMessage = `Server error (${status}): ${responseData.message}`;
            } else if (responseData.error) {
              errorMessage = `Server error (${status}): ${responseData.error}`;
            } else {
              errorMessage = `Server error (${status}): ${JSON.stringify(responseData)}`;
            }
          } else {
            errorMessage = statusText || `Server error: ${status}`;
          }
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check if the backend is running and CORS is configured.';
        } else {
          errorMessage = err.message || 'Failed to execute test';
        }
      } else {
        // Non-Axios error
        errorMessage = err instanceof Error ? err.message : String(err);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>AI Agentic Mobile Tester</h1>

      <div className={styles.mainLayout}>
        {/* Left Panel - Scenarios List */}
        <div className={styles.leftPanel}>
          <div className={styles.panelTitle}>
            <span className="icon">📋</span>Test Scenarios
          </div>
          
          <div className={styles.scenarioControls}>
            <div className={styles.scenarioControlsRow}>
              <button 
                className={`${styles.button} ${styles.btnSecondary}`} 
                onClick={handleNewScenario}
              >New Scenario
              </button>
              
              <button 
                className={`${styles.button} ${styles.btnPrimary}`} 
                onClick={openSaveDialog}
                disabled={!selectedModel || !testGoal.trim() || steps.length === 0}
              >Save</button>
            </div>
          </div>

          {currentScenarioId && (
            <div className={styles.currentScenario}>
              <strong>Editing: </strong>{scenarioName || 'Untitled Scenario'}
            </div>
          )}

          <div className={styles.scenarioList}>
            {scenarios.length === 0 ? (
              <div className={styles.emptyScenarios}>
                <span className="icon">📝</span>
                <div>No scenarios yet</div>
              </div>
            ) : (
              <>
                <h3>Saved Scenarios ({scenarios.length})</h3>
                {scenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className={`${styles.scenarioItem} ${scenario.id === currentScenarioId ? styles.active : ''}`}
                    onClick={() => handleLoadScenario(scenario)}
                  >
                    <div className={styles.scenarioInfo}>
                      <div className={styles.scenarioTitle}>{scenario.name}</div>
                      <div className={styles.scenarioDetails}>
                        {scenario.model} • {scenario.steps.length} steps<br/>
                        Updated: {scenario.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className={styles.scenarioActions}>
                      <button 
                        className={`${styles.button} ${styles.btnSmall} ${styles.btnDanger}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScenario(scenario.id);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Scenario Editor */}
        <div className={styles.rightPanel}>
          <div className={styles.panelTitle}>
            <span className="icon">⚙️</span>
            {currentScenarioId ? 'Edit Scenario' : 'Create New Scenario'}
          </div>

          <div className={styles.formSection}>
            
            <div className={styles.formGroup}>
              <label htmlFor="ai-model">Select AI Model:</label>
              <select
                id="ai-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">- Select a Model -</option>
                <option value="gpt_4">Open Router GPT-4</option>
                <option value="gwen_3">Ollama Gwen 3.0 6B</option>
                <option value="gemini">Gemini 2.0 Flash</option>
                <option value="llama_3_2">Ollama LLaMA 3.2 3B</option>
              </select>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>
              <span className="icon">🎯</span>Test Objective
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="test-goal">Test Goal:</label>
              <textarea
                id="test-goal"
                rows={2}
                placeholder="Describe what you want to test..."
                value={testGoal}
                onChange={(e) => setTestGoal(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className={styles.testStepsSection}>
            <div className={styles.formSectionTitle}>
              <span className="icon">⚡</span>Test Steps ({steps.length})
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
                <div className={styles.emptyState}>No test steps added yet</div>
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
              {error && (
                <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '10px' }}>
                  {error}
                </div>
              )}
              <button 
                className={`${styles.button} ${styles.btnRunTest}`} 
                onClick={handleRunTest}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                <span className="icon">{isLoading ? '⏳' : '▶'} </span>
                {isLoading ? 'Running Test...' : 'Run Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{currentScenarioId ? 'Update Scenario' : 'Save New Scenario'}</h3>
            <input
              type="text"
              placeholder="Enter scenario name..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveScenario();
                }
              }}
            />
            <div className={styles.modalActions}>
              <button 
                className={`${styles.button} ${styles.btnSecondary}`}
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button 
                className={`${styles.button} ${styles.btnPrimary}`}
                onClick={handleSaveScenario}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;