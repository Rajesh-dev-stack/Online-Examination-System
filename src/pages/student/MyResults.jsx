import { useState, useEffect } from 'react';
import { getStudentResults, getQuestionsForExam } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedResult, setSelectedResult] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchResults = async () => {
      const { results: fetchedResults, error } = await getStudentResults(user.uid);
      if (error) {
        toast.error('Failed to fetch results');
      } else {
        // sort by submission date descending
        fetchedResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setResults(fetchedResults);
      }
      setLoading(false);
    };
    fetchResults();
  }, [user.uid]);

  const handleViewDetails = async (result) => {
    setDetailsLoading(true);
    setSelectedResult(result);
    const { questions, error } = await getQuestionsForExam(result.examId);
    if (!error) {
      setExamQuestions(questions);
    }
    setDetailsLoading(false);
  };

  if (loading) return <div>Loading results...</div>;

  return (
    <div>
      <h2 className="mb-4">My Results</h2>

      {!selectedResult ? (
        <div className="card">
          {results.length === 0 ? (
            <p>You have not attempted any exams yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px' }}>Exam Name</th>
                    <th style={{ padding: '12px' }}>Subject</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Marks</th>
                    <th style={{ padding: '12px' }}>Percentage</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}><strong>{r.examTitle}</strong></td>
                      <td style={{ padding: '12px' }}>{r.subject}</td>
                      <td style={{ padding: '12px' }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{r.obtainedMarks} / {r.totalMarks}</td>
                      <td style={{ padding: '12px' }}>{r.percentage}%</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${r.status === 'pass' ? 'badge-active' : 'badge-completed'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.85rem' }} onClick={() => handleViewDetails(r)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <button className="btn mb-3" onClick={() => setSelectedResult(null)}>
            &larr; Back to Results
          </button>
          
          <div className="card mb-4">
            <h3 className="mb-3">{selectedResult.examTitle} - Performance Summary</h3>
            <div className="grid grid-cols-4 gap-3">
              <div><strong>Score:</strong> {selectedResult.obtainedMarks} / {selectedResult.totalMarks}</div>
              <div><strong>Percentage:</strong> {selectedResult.percentage}%</div>
              <div><strong>Status:</strong> <span className={`badge ${selectedResult.status === 'pass' ? 'badge-active' : 'badge-completed'}`}>{selectedResult.status}</span></div>
              <div><strong>Time Taken:</strong> {selectedResult.timeTaken}</div>
            </div>
          </div>

          <h3 className="mb-3">Detailed Answer Sheet</h3>
          {detailsLoading ? (
            <p>Loading questions...</p>
          ) : (
            <div className="d-flex flex-column gap-3" style={{ flexDirection: 'column' }}>
              {examQuestions.map((q, idx) => {
                const studentAnswer = selectedResult.studentAnswers?.[q.id];
                const isCorrect = studentAnswer === q.correctAnswer;
                const isAttempted = !!studentAnswer;
                
                return (
                  <div key={q.id} className="card" style={{ borderLeft: `5px solid ${isCorrect ? 'var(--success)' : (isAttempted ? 'var(--danger)' : '#9ca3af')}` }}>
                    <p><strong>Q{idx + 1}:</strong> {q.questionText} <span style={{ float: 'right', fontSize: '0.9rem' }} className="text-muted">[{q.marks} Marks]</span></p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} style={{ 
                          padding: '8px', 
                          borderRadius: '4px',
                          backgroundColor: q.correctAnswer === opt ? '#dcfce7' : (studentAnswer === opt ? '#fee2e2' : 'transparent'),
                          border: '1px solid #e5e7eb'
                        }}>
                          {opt}) {q[`option${opt}`]}
                          {q.correctAnswer === opt && <span style={{ float: 'right' }}>✅</span>}
                          {studentAnswer === opt && q.correctAnswer !== opt && <span style={{ float: 'right' }}>❌</span>}
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.9rem' }}>
                      {!isAttempted ? (
                        <span className="text-muted">Not Attempted</span>
                      ) : (
                        <span>Your Answer: <strong>{studentAnswer}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyResults;
