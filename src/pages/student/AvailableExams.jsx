import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableExamsForStudents, getStudentResults } from '../../firebase/dbFunctions';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      const [examsRes, resultsRes] = await Promise.all([
        getAvailableExamsForStudents(),
        getStudentResults(user.uid)
      ]);

      if (!examsRes.error && !resultsRes.error) {
        const attemptedIds = resultsRes.results.map(r => r.examId);
        // Map exams and add flag if attempted
        const examsList = examsRes.exams.map(e => ({
          ...e,
          isAttempted: attemptedIds.includes(e.id)
        }));
        setExams(examsList);
      }
      setLoading(false);
    };
    fetchExams();
  }, [user.uid]);

  const handleStart = (examId) => {
    if (window.confirm("Are you sure you want to start this exam? The timer will begin immediately.")) {
      navigate(`/student/exam/${examId}`);
    }
  };

  if (loading) return <div>Loading available exams...</div>;

  return (
    <div>
      <h2 className="mb-4">Available Exams</h2>
      
      {exams.length === 0 ? (
        <div className="card">
          <p>No active exams available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="d-flex justify-between align-center mb-3">
                <h3 style={{ margin: 0 }}>{exam.title}</h3>
                {exam.isAttempted && <span className="badge badge-completed">Attempted</span>}
              </div>
              
              <div style={{ flex: 1 }}>
                <p><strong>Subject:</strong> {exam.subject}</p>
                <p><strong>Duration:</strong> {exam.duration} Minutes</p>
                <p><strong>Passing Marks:</strong> {exam.passingMarks}</p>
                <p><strong>Teacher:</strong> {exam.teacherName}</p>
                
                <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', marginTop: '10px', fontSize: '0.9rem' }}>
                  <strong>Instructions:</strong>
                  <p style={{ margin: '5px 0 0 0', whiteSpace: 'pre-line' }}>{exam.instructions}</p>
                </div>
              </div>

              <button 
                className={`btn mt-4 ${exam.isAttempted ? 'btn-secondary' : 'btn-primary'}`} 
                disabled={exam.isAttempted}
                onClick={() => handleStart(exam.id)}
                style={exam.isAttempted ? { backgroundColor: '#9ca3af', color: 'white' } : {}}
              >
                {exam.isAttempted ? 'Already Attempted' : 'Start Exam'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
