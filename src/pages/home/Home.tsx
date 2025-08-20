import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import axios from 'axios';
import styles from './Home.module.css';

interface TestScenario {
  id: string;
  name: string;
  goal: string;
  steps: { id: number; description: string }[];
  createdAt: Date;
  updatedAt: Date;
}

function Home() {
  const [testGoal, setTestGoal] = useState('');
  const [steps, setSteps] = useState<{ id: number; description: string }[]>([]);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editingStepDescription, setEditingStepDescription] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [stepCounter, setStepCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // New state for scenario management
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  // Removed scenarioName and showSaveDialog state

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
    if (editingStepId === stepId) {
      setEditingStepId(null);
      setEditingStepDescription('');
    }
  };

  const handleEditStep = (stepId: number, description: string) => {
    setEditingStepId(stepId);
    setEditingStepDescription(description);
  };

  const handleEditStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingStepDescription(e.target.value);
  };

  const handleEditStepSave = (stepId: number) => {
    if (editingStepDescription.trim() === '') return;
    setSteps(steps.map(step => step.id === stepId ? { ...step, description: editingStepDescription } : step));
    setEditingStepId(null);
    setEditingStepDescription('');
  };

  const handleEditStepCancel = () => {
    setEditingStepId(null);
    setEditingStepDescription('');
  };

  // Firestore CRUD
  const scenariosCollection = collection(db, 'testScenarios');

  useEffect(() => {
    // Real-time listener for scenarios
    const unsubscribe = onSnapshot(scenariosCollection, (snapshot) => {
      const scenarioList: TestScenario[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          goal: data.goal,
          steps: data.steps,
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
        };
      });
      setScenarios(scenarioList);
    });
    return () => unsubscribe();
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!testGoal.trim() && steps.length === 0) return;
    const autoSave = async () => {
      const now = new Date();
      try {
        if (currentScenarioId) {
          const scenarioRef = doc(db, 'testScenarios', currentScenarioId);
          await updateDoc(scenarioRef, {
            name: testGoal,
            goal: testGoal,
            steps: [...steps],
            updatedAt: now,
          });
        } else if (testGoal.trim() && steps.length > 0) {
          const docRef = await addDoc(scenariosCollection, {
            name: testGoal,
            goal: testGoal,
            steps: [...steps],
            createdAt: now,
            updatedAt: now,
          });
          setCurrentScenarioId(docRef.id);
        }
        setError(null);
        setSuccess('Auto-saved!');
        setTimeout(() => setSuccess(null), 1500);
      } catch (err) {
        setError('Failed to auto-save scenario');
        setSuccess(null);
      }
    };
    autoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testGoal, steps]);

  const handleLoadScenario = (scenario: TestScenario) => {
    setTestGoal(scenario.goal);
    setSteps([...scenario.steps]);
    setCurrentScenarioId(scenario.id);
    const maxStepId = scenario.steps.length > 0 ? Math.max(...scenario.steps.map(s => s.id)) : 0;
    setStepCounter(maxStepId + 1);
    setError(null);
  };

  const handleNewScenario = () => {
    setTestGoal('');
    setSteps([]);
    setCurrentScenarioId(null);
    setStepCounter(1);
    setError(null);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await deleteDoc(doc(db, 'testScenarios', scenarioId));
      if (currentScenarioId === scenarioId) {
        handleNewScenario();
      }
      setError(null);
      setSuccess('Test scenario removed!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete scenario from Firestore');
      setSuccess(null);
    }
  };

  // Remove openSaveDialog, saving is now direct

  const handleRunTest = async () => {
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
        goal: testGoal,
        steps: steps.map(step => step.description),
      };

      let url = '/api/run-test';
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 3 * 60_000, // 3 minutes timeout
        withCredentials: false, // Explicitly disable credentials for CORS
      });

      console.log('Test execution response:', response.data);
  setSuccess('Test executed successfully!');
  setTimeout(() => setSuccess(null), 4000);
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
                        {scenario.steps.length} steps<br/>
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

          <div className={styles.scenarioControls}>
            <div className={styles.scenarioControlsRow}>
              <button 
                className={`${styles.button} ${styles.btnSecondary}`} 
                onClick={handleNewScenario}
              >New Scenario
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Scenario Editor */}
        <div className={styles.rightPanel}>
          <div className={styles.panelTitle}>
            <span className="icon">⚙️</span>
            {currentScenarioId ? 'Edit Scenario' : 'Create New Scenario'}
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
                placeholder="Describe the test's goal..."
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
                Add Step
              </button>
            </div>

            <div className={styles.stepsContainer}>
              {steps.length === 0 ? (
                <div className={styles.emptyState}>No test steps added yet</div>
              ) : (
                steps.map((step, index) => (
                  <div key={step.id} className={styles.stepItem}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div className={styles.stepNumber}>{index + 1}</div>
                      {editingStepId === step.id ? (
                        <>
                          <input
                            type="text"
                            value={editingStepDescription}
                            onChange={handleEditStepChange}
                            className={styles.stepEditInput}
                            style={{ flex: 1, marginRight: '8px', background: '#f0f0f0', color: '#333' }}
                          />
                          <button
                            className={`${styles.button} ${styles.btnSmall} ${styles.btnPrimary}`}
                            onClick={() => handleEditStepSave(step.id)}
                            style={{ marginRight: '4px' }}
                          >Save</button>
                          <button
                            className={`${styles.button} ${styles.btnSmall} ${styles.btnSecondary}`}
                            onClick={handleEditStepCancel}
                            style={{ marginRight: '4px' }}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <div className={styles.stepContent} style={{ flex: 1 }}>{step.description}</div>
                          <button
                            className={`${styles.button} ${styles.btnEdit}`}
                            onClick={() => handleEditStep(step.id, step.description)}
                            title="Edit step"
                          >
                            <span className="icon">✏️</span>
                          </button>
                        </>
                      )}
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
              {success && (
                <div className={styles.successMessage} style={{ color: 'green', marginBottom: '10px' }}>
                  {success}
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

  {/* Removed Save Dialog modal */}
    </div>
  );
}

export default Home;