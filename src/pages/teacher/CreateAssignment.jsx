import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAssignment } from '../../firebase/dbFunctions';
import { generateQuestions } from '../../utils/AIhelper';
import { parseExcelQuestions, downloadExcelTemplate } from '../../utils/excelHelper';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [step, setStep] = useState(1);
  const [assignmentDetails, setAssignmentDetails] = useState({
    title: '', subject: '', description: '', dueDate: '', totalMarks: '', targetCourse: '', targetSection: ''
  });

  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const [manualQ, setManualQ] = useState({
    type: 'MCQ', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: '5'
  });

  const [aiState, setAiState] = useState({
    topic: '', numQs: '3', type: 'Short Answer', generatedQs: []
  });

  const handleDetailsChange = (e) => setAssignmentDetails({ ...assignmentDetails, [e.target.name]: e.target.value });

  const saveAssignmentDetails = (e) => {
    e.preventDefault();
    setStep(2);
    toast.success('Details saved! Now add questions.');
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    const newQ = { ...manualQ, marks: parseInt(manualQ.marks), source: 'manual' };
    setQuestions([...questions, newQ]);
    setManualQ({ type: 'MCQ', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: '5' });
    toast.success('Question added');
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast('AI is generating...');
    try {
      // In a full app, we'd have a separate Nvidia prompt for non-MCQ. Here we'll adapt slightly or just use the MCQ one if MCQ is selected. 
      // For simplicity in this demo, if it's not MCQ, we still use the helper but ignore options.
      const generated = await generateQuestions(aiState.topic, parseInt(aiState.numQs), "Medium", assignmentDetails.subject);
      
      const mapped = generated.map(q => {
        if (aiState.type === 'MCQ') return { ...q, type: 'MCQ', selected: true };
        return { 
          questionText: q.questionText, 
          marks: q.marks * 5, // Give more marks for short/long
          type: aiState.type, 
          source: 'ai',
          selected: true
        };
      });
      setAiState({ ...aiState, generatedQs: mapped });
      toast.success('Questions generated!');
    } catch (err) {
      toast.error(`AI Error: ${err.message}`);
    }
    setLoading(false);
  };

  const addSelectedAiToPool = () => {
    const selected = aiState.generatedQs.filter(q => q.selected).map(q => {
      const { selected, ...rest } = q;
      return rest;
    });
    setQuestions([...questions, ...selected]);
    setAiState({ ...aiState, generatedQs: [] });
    toast.success('Added to assignment');
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      toast.error("Add at least one question.");
      return;
    }
    setPublishLoading(true);
    
    const assignmentData = {
      ...assignmentDetails,
      teacherId: user.uid,
      teacherName: user.name,
      totalMarks: questions.reduce((sum, q) => sum + parseInt(q.marks), 0),
      status: 'active',
      questionSource: 'mixed',
      questions: questions
    };

    const { error } = await createAssignment(assignmentData);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Assignment Published!');
      navigate('/teacher/manage-assignments');
    }
    setPublishLoading(false);
  };

  const getSourceBadge = (source) => {
    if (source === 'ai') return <span className="badge" style={{ backgroundColor: '#7c3aed', color: 'white' }}>AI</span>;
    if (source === 'excel') return <span className="badge" style={{ backgroundColor: '#16a34a', color: 'white' }}>Excel</span>;
    return <span className="badge" style={{ backgroundColor: '#ea580c', color: 'white' }}>Manual</span>;
  };

  return (
    <div>
      <h2 className="mb-4">{step === 1 ? 'Create Assignment' : 'Add Assignment Questions'}</h2>

      {step === 1 && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <form onSubmit={saveAssignmentDetails}>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label>Assignment Title</label><input type="text" name="title" className="form-control" required onChange={handleDetailsChange} /></div>
              <div className="form-group"><label>Subject</label><input type="text" name="subject" className="form-control" required onChange={handleDetailsChange} /></div>
              
              <div className="form-group"><label>Course</label>
                <select name="targetCourse" className="form-control" required onChange={handleDetailsChange}>
                  <option value="">Select Course</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BSc">BSc</option>
                  <option value="BA">BA</option>
                  <option value="BCom">BCom</option>
                </select>
              </div>
              
              <div className="form-group"><label>Section</label>
                <select name="targetSection" className="form-control" required onChange={handleDetailsChange}>
                  <option value="">Select Section</option>
                  <option value="All">All Sections</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="form-group"><label>Due Date & Time</label><input type="datetime-local" name="dueDate" className="form-control" required onChange={handleDetailsChange} /></div>
            </div>
            <div className="form-group mt-3"><label>Description / Instructions</label><textarea name="description" className="form-control" rows="4" required onChange={handleDetailsChange}></textarea></div>
            <button type="submit" className="btn btn-primary mt-3">Next Step</button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="card mb-3" style={{ padding: '0', display: 'flex', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <button className="btn" style={{ flex: 1, borderRadius: 0, backgroundColor: activeTab === 'ai' ? 'var(--primary)' : 'transparent', color: activeTab === 'ai' ? 'white' : 'var(--text-dark)' }} onClick={() => setActiveTab('ai')}>AI</button>
              <button className="btn" style={{ flex: 1, borderRadius: 0, backgroundColor: activeTab === 'manual' ? '#ea580c' : 'transparent', color: activeTab === 'manual' ? 'white' : 'var(--text-dark)' }} onClick={() => setActiveTab('manual')}>Manual</button>
            </div>

            {activeTab === 'manual' && (
              <div className="card">
                <form onSubmit={handleManualAdd}>
                  <div className="form-group">
                    <label>Question Type</label>
                    <select className="form-control" value={manualQ.type} onChange={(e) => setManualQ({...manualQ, type: e.target.value})}>
                      <option value="MCQ">MCQ</option>
                      <option value="Short Answer">Short Answer</option>
                      <option value="Long Answer">Long Answer</option>
                    </select>
                  </div>
                  
                  <div className="form-group"><label>Question Text</label><textarea className="form-control" rows="3" required value={manualQ.questionText} onChange={(e)=>setManualQ({...manualQ, questionText: e.target.value})}></textarea></div>
                  
                  {manualQ.type === 'MCQ' && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="form-group"><label>Option A</label><input type="text" className="form-control" required value={manualQ.optionA} onChange={(e)=>setManualQ({...manualQ, optionA: e.target.value})} /></div>
                      <div className="form-group"><label>Option B</label><input type="text" className="form-control" required value={manualQ.optionB} onChange={(e)=>setManualQ({...manualQ, optionB: e.target.value})} /></div>
                      <div className="form-group"><label>Option C</label><input type="text" className="form-control" required value={manualQ.optionC} onChange={(e)=>setManualQ({...manualQ, optionC: e.target.value})} /></div>
                      <div className="form-group"><label>Option D</label><input type="text" className="form-control" required value={manualQ.optionD} onChange={(e)=>setManualQ({...manualQ, optionD: e.target.value})} /></div>
                      <div className="form-group">
                        <label>Correct Answer</label>
                        <select className="form-control" value={manualQ.correctAnswer} onChange={(e)=>setManualQ({...manualQ, correctAnswer: e.target.value})}>
                          <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="form-group"><label>Marks</label><input type="number" className="form-control" min="1" required value={manualQ.marks} onChange={(e)=>setManualQ({...manualQ, marks: e.target.value})} /></div>
                  <button type="submit" className="btn btn-primary mt-2">Add Question</button>
                </form>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="card">
                <form onSubmit={handleAiGenerate}>
                  <div className="form-group"><label>Topic</label><input type="text" className="form-control" required value={aiState.topic} onChange={(e)=>setAiState({...aiState, topic: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-group">
                      <label>Number of Questions</label>
                      <input type="number" className="form-control" min="1" max="50" required value={aiState.numQs} onChange={(e)=>setAiState({...aiState, numQs: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select className="form-control" value={aiState.type} onChange={(e)=>setAiState({...aiState, type: e.target.value})}>
                        <option value="MCQ">MCQ</option><option value="Short Answer">Short Answer</option><option value="Long Answer">Long Answer</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn mt-3" style={{ backgroundColor: '#7c3aed', color: 'white', width: '100%' }} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                </form>
                {aiState.generatedQs.length > 0 && (
                  <div className="mt-3">
                    {aiState.generatedQs.map((q, idx) => (
                      <div key={idx} style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                        <label className="d-flex align-center gap-2">
                          <input type="checkbox" checked={q.selected} onChange={(e)=>{
                            const updated = [...aiState.generatedQs]; updated[idx].selected = e.target.checked; setAiState({...aiState, generatedQs: updated});
                          }} />
                          <strong>Q:</strong> {q.questionText}
                        </label>
                      </div>
                    ))}
                    <button onClick={addSelectedAiToPool} className="btn btn-primary mt-2">Add Selected</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="card">
              <div className="d-flex justify-between align-center mb-3">
                <h3>Assignment Questions ({questions.length})</h3>
                <div><strong>Total Marks:</strong> {questions.reduce((sum, q) => sum + parseInt(q.marks), 0)}</div>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {questions.map((q, index) => (
                  <div key={index} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                    <div className="d-flex justify-between mb-2">
                      <strong>Q{index + 1} ({q.type})</strong>
                      {getSourceBadge(q.source)}
                    </div>
                    <p>{q.questionText}</p>
                    <div className="d-flex justify-between mt-2 align-center">
                      <span className="badge badge-active">{q.marks} Marks</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-success mt-4" style={{ width: '100%' }} disabled={questions.length === 0 || publishLoading} onClick={handlePublish}>
                {publishLoading ? 'Publishing...' : 'Publish Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAssignment;
