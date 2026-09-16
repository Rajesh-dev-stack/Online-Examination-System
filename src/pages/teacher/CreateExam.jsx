import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam, addQuestionToExam, updateExamStatus } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const CreateExam = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [step, setStep] = useState(1);
  const [examId, setExamId] = useState(null);
  
  // Step 1: Exam Details
  const [examDetails, setExamDetails] = useState({
    title: '',
    subject: '',
    duration: '',
    passingMarks: '',
    startTime: '',
    endTime: '',
    instructions: ''
  });

  // Step 2: Questions
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: '1'
  });

  const [loading, setLoading] = useState(false);

  const handleDetailsChange = (e) => {
    setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, [e.target.name]: e.target.value });
  };

  const saveExamDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const examData = {
      ...examDetails,
      teacherId: user.uid,
      teacherName: user.name,
      duration: parseInt(examDetails.duration),
      passingMarks: parseInt(examDetails.passingMarks),
      status: 'upcoming', // default status
      totalMarks: 0 // Will update later
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

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const questionData = {
      ...currentQuestion,
      marks: parseInt(currentQuestion.marks)
    };

    const { id, error } = await addQuestionToExam(examId, questionData);
    
    if (error) {
      toast.error(error);
    } else {
      setQuestions([...questions, { id, ...questionData }]);
      // Reset form
      setCurrentQuestion({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: '1'
      });
      toast.success('Question added!');
    }
    setLoading(false);
  };

  const handlePublishExam = async () => {
    toast.success('Exam Published Successfully!');
    navigate('/teacher/manage-exams');
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div>
      <h2 className="mb-4">{step === 1 ? 'Create New Exam' : 'Add Questions'}</h2>

      {step === 1 && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <form onSubmit={saveExamDetails}>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label>Exam Title</label>
                <input type="text" name="title" className="form-control" required onChange={handleDetailsChange} />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subject" className="form-control" required onChange={handleDetailsChange} />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" name="duration" className="form-control" min="1" required onChange={handleDetailsChange} />
              </div>
              <div className="form-group">
                <label>Passing Marks</label>
                <input type="number" name="passingMarks" className="form-control" min="1" required onChange={handleDetailsChange} />
              </div>
              <div className="form-group">
                <label>Start Date & Time</label>
                <input type="datetime-local" name="startTime" className="form-control" required onChange={handleDetailsChange} />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input type="datetime-local" name="endTime" className="form-control" required onChange={handleDetailsChange} />
              </div>
            </div>
            
            <div className="form-group mt-3">
              <label>Exam Instructions</label>
              <textarea name="instructions" className="form-control" rows="4" required onChange={handleDetailsChange}></textarea>
            </div>

            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
              {loading ? 'Saving...' : 'Save Exam & Continue'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Add Question Form */}
          <div className="card">
            <h3 className="mb-3">Add Question</h3>
            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label>Question Text</label>
                <textarea name="questionText" className="form-control" rows="3" required value={currentQuestion.questionText} onChange={handleQuestionChange}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label>Option A</label>
                  <input type="text" name="optionA" className="form-control" required value={currentQuestion.optionA} onChange={handleQuestionChange} />
                </div>
                <div className="form-group">
                  <label>Option B</label>
                  <input type="text" name="optionB" className="form-control" required value={currentQuestion.optionB} onChange={handleQuestionChange} />
                </div>
                <div className="form-group">
                  <label>Option C</label>
                  <input type="text" name="optionC" className="form-control" required value={currentQuestion.optionC} onChange={handleQuestionChange} />
                </div>
                <div className="form-group">
                  <label>Option D</label>
                  <input type="text" name="optionD" className="form-control" required value={currentQuestion.optionD} onChange={handleQuestionChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="form-group">
                  <label>Correct Answer</label>
                  <select name="correctAnswer" className="form-control" value={currentQuestion.correctAnswer} onChange={handleQuestionChange}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks</label>
                  <input type="number" name="marks" className="form-control" min="1" required value={currentQuestion.marks} onChange={handleQuestionChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                {loading ? 'Adding...' : 'Add Question'}
              </button>
            </form>
          </div>

          {/* Question List */}
          <div className="card">
            <div className="d-flex justify-between align-center mb-3">
              <h3>Added Questions ({questions.length})</h3>
              <div><strong>Total Marks:</strong> {totalMarks}</div>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {questions.length === 0 ? (
                <p className="text-muted">No questions added yet.</p>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} style={{ border: '1px solid #e5e7eb', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                    <p><strong>Q{index + 1}:</strong> {q.questionText} <span className="badge badge-active" style={{float:'right'}}>{q.marks} Marks</span></p>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
                      <div>A) {q.optionA}</div>
                      <div>B) {q.optionB}</div>
                      <div>C) {q.optionC}</div>
                      <div>D) {q.optionD}</div>
                    </div>
                    <p className="mt-2" style={{ color: 'var(--success)', fontWeight: 'bold' }}>Correct: {q.correctAnswer}</p>
                  </div>
                ))
              )}
            </div>

            <button 
              className="btn btn-success mt-4" 
              style={{ width: '100%' }}
              disabled={questions.length === 0}
              onClick={handlePublishExam}
            >
              Publish Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExam;
