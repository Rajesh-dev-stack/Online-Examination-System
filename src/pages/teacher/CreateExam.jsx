import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam, addQuestionToExam } from '../../firebase/dbFunctions';
import { generateQuestions } from '../../utils/AIhelper';
import { parseExcelQuestions, downloadExcelTemplate } from '../../utils/excelHelper';
import toast from 'react-hot-toast';

const CreateExam = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  const [step, setStep] = useState(1);
  const [examId, setExamId] = useState(null);
  
  // Step 1: Exam Details
  const [examDetails, setExamDetails] = useState({
    title: '', subject: '', duration: '', passingMarks: '', startTime: '', endTime: '', instructions: '', targetCourse: '', targetSection: ''
  });

  // Step 2: Question Pool & Tabs
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Manual Entry State
  const [manualQ, setManualQ] = useState({
    questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: '1'
  });

  // AI Entry State
  const [aiState, setAiState] = useState({
    topic: '', numQs: '5', difficulty: 'Medium', generatedQs: []
  });

  const handleDetailsChange = (e) => setExamDetails({ ...examDetails, [e.target.name]: e.target.value });

  const saveExamDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const examData = {
      ...examDetails,
      teacherId: user.uid,
      teacherName: user.name,
      duration: parseInt(examDetails.duration),
      passingMarks: parseInt(examDetails.passingMarks),
      status: 'upcoming',
      totalMarks: 0, // Will update when published
      questionSource: 'mixed'
    };

    const { id, error } = await createExam(examData);
    if (error) {
      toast.error(error);
    } else {
      setExamId(id);
      setStep(2);
      toast.success('Exam details saved! Now add questions.');
    }
    setLoading(false);
  };

  // --- MANUAL ---
  const handleManualAdd = (e) => {
    e.preventDefault();
    const newQ = { ...manualQ, marks: parseInt(manualQ.marks), source: 'manual' };
    setQuestions([...questions, newQ]);
    setManualQ({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: '1' });
    toast.success('Question added to pool');
  };

  // --- AI ---
  const handleAiGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast('AI is generating questions...');
    try {
      const generated = await generateQuestions(aiState.topic, parseInt(aiState.numQs), aiState.difficulty, examDetails.subject);
      setAiState({ ...aiState, generatedQs: generated.map(q => ({ ...q, selected: true })) });
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
    toast.success(`${selected.length} AI questions added to pool`);
  };

  // --- EXCEL ---
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsedQs = await parseExcelQuestions(file);
      setQuestions([...questions, ...parsedQs]);
      toast.success(`${parsedQs.length} questions added from Excel`);
    } catch (err) {
      toast.error('Failed to parse Excel file');
    }
    e.target.value = ''; // Reset
  };

  const removeQuestion = (idx) => {
    const newQs = [...questions];
    newQs.splice(idx, 1);
    setQuestions(newQs);
  };

  const handlePublishExam = async () => {
    if (questions.length === 0) {
      toast.error("Add at least one question before publishing.");
      return;
    }
    setPublishLoading(true);
    
    let totalMarks = 0;
    for (const q of questions) {
      totalMarks += q.marks;
      await addQuestionToExam(examId, q);
    }
    
    toast.success('Exam Published Successfully!');
    navigate('/teacher/manage-exams');
    setPublishLoading(false);
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const getSourceBadge = (source) => {
    if (source === 'ai') return <span className="badge" style={{ backgroundColor: '#7c3aed', color: 'white' }}>AI</span>;
    if (source === 'excel') return <span className="badge" style={{ backgroundColor: '#16a34a', color: 'white' }}>Excel</span>;
    return <span className="badge" style={{ backgroundColor: '#ea580c', color: 'white' }}>Manual</span>;
  };

  return (
    <div>
      <h2 className="mb-4">{step === 1 ? 'Create New Exam' : 'Add Questions to Exam'}</h2>

      {step === 1 && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <form onSubmit={saveExamDetails}>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group"><label>Exam Title</label><input type="text" name="title" className="form-control" required onChange={handleDetailsChange} /></div>
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

              <div className="form-group"><label>Duration (minutes)</label><input type="number" name="duration" className="form-control" min="1" required onChange={handleDetailsChange} /></div>
              <div className="form-group"><label>Passing Marks</label><input type="number" name="passingMarks" className="form-control" min="1" required onChange={handleDetailsChange} /></div>
              <div className="form-group"><label>Start Date & Time</label><input type="datetime-local" name="startTime" className="form-control" required onChange={handleDetailsChange} /></div>
              <div className="form-group"><label>End Date & Time</label><input type="datetime-local" name="endTime" className="form-control" required onChange={handleDetailsChange} /></div>
            </div>
            <div className="form-group mt-3"><label>Exam Instructions</label><textarea name="instructions" className="form-control" rows="4" required onChange={handleDetailsChange}></textarea></div>
            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>{loading ? 'Saving...' : 'Save Exam & Continue'}</button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="card mb-3" style={{ padding: '0', display: 'flex', borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <button className="btn" style={{ flex: 1, borderRadius: 0, backgroundColor: activeTab === 'ai' ? 'var(--primary)' : 'transparent', color: activeTab === 'ai' ? 'white' : 'var(--text-dark)' }} onClick={() => setActiveTab('ai')}>AI Generate</button>
              <button className="btn" style={{ flex: 1, borderRadius: 0, backgroundColor: activeTab === 'excel' ? '#16a34a' : 'transparent', color: activeTab === 'excel' ? 'white' : 'var(--text-dark)' }} onClick={() => setActiveTab('excel')}>Upload Excel</button>
              <button className="btn" style={{ flex: 1, borderRadius: 0, backgroundColor: activeTab === 'manual' ? '#ea580c' : 'transparent', color: activeTab === 'manual' ? 'white' : 'var(--text-dark)' }} onClick={() => setActiveTab('manual')}>Manual Entry</button>
            </div>

            {/* TAB: MANUAL */}
            {activeTab === 'manual' && (
              <div className="card">
                <form onSubmit={handleManualAdd}>
                  <div className="form-group"><label>Question Text</label><textarea name="questionText" className="form-control" rows="3" required value={manualQ.questionText} onChange={(e)=>setManualQ({...manualQ, questionText: e.target.value})}></textarea></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-group"><label>Option A</label><input type="text" className="form-control" required value={manualQ.optionA} onChange={(e)=>setManualQ({...manualQ, optionA: e.target.value})} /></div>
                    <div className="form-group"><label>Option B</label><input type="text" className="form-control" required value={manualQ.optionB} onChange={(e)=>setManualQ({...manualQ, optionB: e.target.value})} /></div>
                    <div className="form-group"><label>Option C</label><input type="text" className="form-control" required value={manualQ.optionC} onChange={(e)=>setManualQ({...manualQ, optionC: e.target.value})} /></div>
                    <div className="form-group"><label>Option D</label><input type="text" className="form-control" required value={manualQ.optionD} onChange={(e)=>setManualQ({...manualQ, optionD: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="form-group">
                      <label>Correct Answer</label>
                      <select className="form-control" value={manualQ.correctAnswer} onChange={(e)=>setManualQ({...manualQ, correctAnswer: e.target.value})}>
                        <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Marks</label><input type="number" className="form-control" min="1" required value={manualQ.marks} onChange={(e)=>setManualQ({...manualQ, marks: e.target.value})} /></div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3">Add Question</button>
                </form>
              </div>
            )}

            {/* TAB: AI */}
            {activeTab === 'ai' && (
              <div className="card">
                <form onSubmit={handleAiGenerate}>
                  <div className="form-group"><label>Topic</label><input type="text" className="form-control" required value={aiState.topic} onChange={(e)=>setAiState({...aiState, topic: e.target.value})} placeholder="e.g. React, Software...." /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-group">
                      <label>Number of Questions</label>
                      <input type="number" className="form-control" min="1" max="50" required value={aiState.numQs} onChange={(e)=>setAiState({...aiState, numQs: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select className="form-control" value={aiState.difficulty} onChange={(e)=>setAiState({...aiState, difficulty: e.target.value})}>
                        <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn mt-3" style={{ backgroundColor: '#7c3aed', color: 'white', width: '100%' }} disabled={loading}>
                    {loading ? 'AI is generating...' : 'Generate Questions'}
                  </button>
                </form>
                
                {aiState.generatedQs.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <h4 className="mb-2">Generated Questions:</h4>
                    {aiState.generatedQs.map((q, idx) => (
                      <div key={idx} style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                        <label className="d-flex align-center gap-2">
                          <input type="checkbox" checked={q.selected} onChange={(e)=>{
                            const updated = [...aiState.generatedQs];
                            updated[idx].selected = e.target.checked;
                            setAiState({...aiState, generatedQs: updated});
                          }} />
                          <strong>Q:</strong> {q.questionText} (Answer: {q.correctAnswer})
                        </label>
                      </div>
                    ))}
                    <button onClick={addSelectedAiToPool} className="btn btn-primary mt-2">Add Selected to Exam</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: EXCEL */}
            {activeTab === 'excel' && (
              <div className="card text-center">
                <p className="mb-3">Upload questions from an Excel sheet. Make sure to use the exact format from the template.</p>
                <button type="button" className="btn btn-secondary mb-4" style={{ backgroundColor: '#4b5563', color: 'white' }} onClick={downloadExcelTemplate}>
                  Download Template
                </button>
                
                <div className="form-group">
                  <label style={{ display: 'block', padding: '30px', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb' }}>
                    <br/>
                    Click to upload Excel file (.xlsx)
                    <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleExcelUpload} />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* QUESTION POOL */}
          <div>
            <div className="card">
              <div className="d-flex justify-between align-center mb-3">
                <h3>Question Pool ({questions.length})</h3>
                <div><strong>Total Marks:</strong> {totalMarks}</div>
              </div>
              
              <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                {questions.length === 0 ? (
                  <p className="text-muted text-center py-4">No questions added yet.<br/>Use AI, Excel, or Manual tabs to add.</p>
                ) : (
                  questions.map((q, index) => (
                    <div key={index} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px', marginBottom: '10px', position: 'relative' }}>
                      <div className="d-flex justify-between mb-2">
                        <strong>Q{index + 1}</strong>
                        <div>
                          {getSourceBadge(q.source)}
                          <button className="btn btn-danger ml-2" style={{ padding: '2px 6px', fontSize: '0.75rem', marginLeft: '5px' }} onClick={() => removeQuestion(index)}>X</button>
                        </div>
                      </div>
                      <p className="mb-2">{q.questionText}</p>
                      <div className="grid grid-cols-2 gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
                        <div>A) {q.optionA}</div><div>B) {q.optionB}</div>
                        <div>C) {q.optionC}</div><div>D) {q.optionD}</div>
                      </div>
                      <div className="d-flex justify-between mt-2 align-center">
                        <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem' }}>Correct: {q.correctAnswer}</span>
                        <span className="badge badge-active">{q.marks} Marks</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                className="btn btn-success mt-4" 
                style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}
                disabled={questions.length === 0 || publishLoading}
                onClick={handlePublishExam}
              >
                {publishLoading ? 'Publishing...' : 'Publish Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExam;
