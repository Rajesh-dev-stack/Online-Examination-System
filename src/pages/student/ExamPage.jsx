import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById, getQuestionsForExam, submitResult } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' }
  const [reviewMarked, setReviewMarked] = useState([]); // [questionId]
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);

  // Initialize Exam & Questions
  useEffect(() => {
    const fetchExamData = async () => {
      const { exam: examData, error: examError } = await getExamById(examId);
      if (examError) {
        toast.error("Exam not found!");
        navigate('/student/dashboard');
        return;
      }
      
      const { questions: qs, error: qError } = await getQuestionsForExam(examId);
      if (qError) {
        toast.error("Error loading questions");
        return;
      }
      
      setExam(examData);
      setQuestions(qs);
      
      // Timer setup (persist on refresh using localStorage)
      const storedEndTime = localStorage.getItem(`exam_${examId}_endTime`);
      let endTime;
      if (storedEndTime) {
        endTime = parseInt(storedEndTime);
      } else {
        endTime = Date.now() + examData.duration * 60 * 1000;
        localStorage.setItem(`exam_${examId}_endTime`, endTime);
      }
      
      const calculateTimeLeft = () => Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(calculateTimeLeft());
      
      timerRef.current = setInterval(() => {
        const tl = calculateTimeLeft();
        setTimeLeft(tl);
        if (tl <= 0) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
        }
      }, 1000);
      
      setLoading(false);
    };
    
    fetchExamData();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId, navigate]);

  // Anti-cheating (Tab switch detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(w => {
          const newW = w + 1;
          alert(`⚠️ Warning! Do not switch tabs! (Warning ${newW})`);
          return newW;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSubmit = async (isAuto = false) => {
    if (submitting) return;
    
    if (!isAuto) {
      if (!window.confirm("Are you sure you want to submit the exam?")) return;
    } else {
      toast("Time Up! Exam Submitted.", { icon: '⏳' });
    }
    
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    let obtainedMarks = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let totalMarks = 0;
    
    questions.forEach(q => {
      totalMarks += q.marks;
      if (answers[q.id]) {
        if (answers[q.id] === q.correctAnswer) {
          obtainedMarks += q.marks;
          correctAnswersCount++;
        } else {
          wrongAnswersCount++;
        }
      }
    });
    
    const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;
    const isPass = obtainedMarks >= exam.passingMarks;
    
    // Time taken calculation
    const durationSecs = exam.duration * 60;
    const timeTakenSecs = durationSecs - timeLeft;
    const minsTaken = Math.floor(timeTakenSecs / 60);
    const secsTaken = timeTakenSecs % 60;
    const timeTakenStr = `${minsTaken}m ${secsTaken}s`;

    const resultData = {
      examId,
      examTitle: exam.title,
      subject: exam.subject,
      studentId: user.uid,
      studentName: user.name,
      rollNumber: user.rollNumber,
      totalQuestions: questions.length,
      attemptedQuestions: Object.keys(answers).length,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      totalMarks,
      obtainedMarks,
      percentage: parseFloat(percentage),
      status: isPass ? 'pass' : 'fail',
      timeTaken: timeTakenStr,
      warningsCount: warnings,
      studentAnswers: answers // Store their answers for review later
    };

    const { id, error } = await submitResult(resultData);
    
    if (error) {
      toast.error("Failed to submit result");
      setSubmitting(false);
    } else {
      localStorage.removeItem(`exam_${examId}_endTime`);
      navigate(`/student/result/${id}`, { replace: true });
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = questions[currentQIndex];
  
  if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><h2>Loading Exam...</h2></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, color: 'white' }}>{exam.title}</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
            Time Left: {formatTime(timeLeft)}
          </div>
          <button className="btn btn-danger" onClick={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Question Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {questions.length > 0 ? (
            <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
              <div className="d-flex justify-between align-center mb-4">
                <h3 style={{ margin: 0 }}>Question {currentQIndex + 1} of {questions.length}</h3>
                <span className="badge badge-active">{currentQ.marks} Marks</span>
              </div>
              
              <div style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                {currentQ.questionText}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <label 
                    key={opt} 
                    style={{ 
                      padding: '15px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      cursor: 'pointer',
                      backgroundColor: answers[currentQ.id] === opt ? '#eff6ff' : 'white',
                      borderColor: answers[currentQ.id] === opt ? 'var(--primary)' : '#d1d5db'
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`question-${currentQ.id}`} 
                      checked={answers[currentQ.id] === opt}
                      onChange={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>{opt})</span> 
                    {currentQ[`option${opt}`]}
                  </label>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="d-flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button 
                  className="btn btn-warning" 
                  onClick={() => {
                    if (reviewMarked.includes(currentQ.id)) {
                      setReviewMarked(reviewMarked.filter(id => id !== currentQ.id));
                    } else {
                      setReviewMarked([...reviewMarked, currentQ.id]);
                    }
                  }}
                >
                  {reviewMarked.includes(currentQ.id) ? 'Unmark Review' : 'Mark for Review'}
                </button>
                
                <div className="d-flex gap-2">
                  <button 
                    className="btn" 
                    style={{ backgroundColor: '#e5e7eb' }}
                    onClick={() => {
                      const newAnswers = { ...answers };
                      delete newAnswers[currentQ.id];
                      setAnswers(newAnswers);
                    }}
                  >
                    Clear Response
                  </button>
                  <button 
                    className="btn btn-primary"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(i => i - 1)}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn-primary"
                    disabled={currentQIndex === questions.length - 1}
                    onClick={() => setCurrentQIndex(i => i + 1)}
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>No questions found for this exam.</p>
          )}
        </div>

        {/* Navigation Sidebar */}
        <div style={{ width: '300px', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-3">Question Palette</h3>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {questions.map((q, idx) => {
              const isAttempted = !!answers[q.id];
              const isMarked = reviewMarked.includes(q.id);
              const isCurrent = idx === currentQIndex;
              
              let bgColor = 'white';
              let color = 'black';
              let border = '1px solid #d1d5db';
              
              if (isCurrent) {
                border = '2px solid var(--primary)';
              }
              
              if (isAttempted) {
                bgColor = 'var(--success)';
                color = 'white';
                border = 'none';
              }
              
              if (isMarked) {
                bgColor = 'var(--warning)';
                color = 'white';
                border = 'none';
              }
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: bgColor,
                    color: color,
                    border: border,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div style={{ marginTop: 'auto', fontSize: '0.9rem' }}>
            <p>Attempted: {Object.keys(answers).length} / {questions.length}</p>
            <div className="d-flex align-center gap-2 mb-2">
              <div style={{ width: 15, height: 15, backgroundColor: 'var(--success)', borderRadius: '50%' }}></div> Answered
            </div>
            <div className="d-flex align-center gap-2 mb-2">
              <div style={{ width: 15, height: 15, backgroundColor: 'var(--warning)', borderRadius: '50%' }}></div> Marked for Review
            </div>
            <div className="d-flex align-center gap-2">
              <div style={{ width: 15, height: 15, backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '50%' }}></div> Not Answered
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ExamPage;
