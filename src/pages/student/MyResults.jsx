import { useState, useEffect } from 'react';
import { getStudentResults, getQuestionsForExam } from '../../firebase/dbFunctions';
import { normalizeCorrectAnswer, normalizeStudentAnswer } from '../../utils/normalizeAnswer';
import toast from 'react-hot-toast';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedResult, setSelectedResult] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem('user'));

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

  // Real-time recalculation of score in case legacy results had matching bugs
  const computedObtained = examQuestions.length > 0 
    ? examQuestions.reduce((sum, q) => {
        const correctL = normalizeCorrectAnswer(q);
        const studentL = normalizeStudentAnswer(selectedResult?.studentAnswers?.[q.id], q);
        return (correctL && studentL && correctL === studentL) ? sum + (Number(q.marks) || 1) : sum;
      }, 0)
    : (selectedResult?.obtainedMarks ?? 0);

  const computedTotal = examQuestions.length > 0 
    ? examQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0)
    : (selectedResult?.totalMarks ?? 0);

  const displayScore = computedTotal > 0 ? computedObtained : selectedResult?.obtainedMarks;
  const displayTotal = computedTotal > 0 ? computedTotal : selectedResult?.totalMarks;
  const displayPercentage = displayTotal > 0 ? ((displayScore / displayTotal) * 100).toFixed(2) : selectedResult?.percentage;

  return (
    <div>
      <h2 className="mb-4">My Results</h2>

      {!selectedResult ? (
        <div>
          {results.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px' }}>
              <h3 className="text-muted" style={{ margin: 0 }}>No results available.</h3>
              <p className="text-muted mt-2">You have not attempted any exams yet.</p>
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
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
              <div><strong>Score:</strong> {displayScore} / {displayTotal}</div>
              <div><strong>Percentage:</strong> {displayPercentage}%</div>
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
                const correctLetter = normalizeCorrectAnswer(q);
                const studentLetter = normalizeStudentAnswer(selectedResult.studentAnswers?.[q.id], q);
                const isAttempted = !!studentLetter;
                const isCorrect = isAttempted && studentLetter === correctLetter;
                
                return (
                  <div 
                    key={q.id} 
                    className="card" 
                    style={{ 
                      borderLeft: `6px solid ${isCorrect ? 'var(--success)' : (isAttempted ? 'var(--danger)' : '#9ca3af')}`,
                      marginBottom: '16px' 
                    }}
                  >
                    <div className="d-flex justify-between align-center mb-2">
                      <p style={{ margin: 0, fontSize: '1.05rem' }}>
                        <strong>Q{idx + 1}:</strong> {q.questionText}
                      </p>
                      <span className="badge badge-active" style={{ fontSize: '0.85rem' }}>
                        {q.marks} Marks
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const isThisCorrect = correctLetter === opt;
                        const isThisStudent = studentLetter === opt;
                        
                        let bgColor = 'white';
                        let borderColor = '#e5e7eb';
                        let badge = null;
                        
                        if (isThisCorrect && isThisStudent) {
                          bgColor = '#dcfce7'; // green
                          borderColor = '#16a34a';
                          badge = <span style={{ float: 'right', fontWeight: 'bold', color: '#166534' }}>(Your Answer - Correct ✓)</span>;
                        } else if (isThisCorrect) {
                          bgColor = '#dcfce7'; // green
                          borderColor = '#16a34a';
                          badge = <span style={{ float: 'right', fontWeight: 'bold', color: '#166534' }}>(Correct Answer ✓)</span>;
                        } else if (isThisStudent) {
                          bgColor = '#fee2e2'; // red
                          borderColor = '#dc2626';
                          badge = <span style={{ float: 'right', fontWeight: 'bold', color: '#991b1b' }}>(Your Answer - Incorrect ✗)</span>;
                        }
                        
                        return (
                          <div 
                            key={opt} 
                            style={{ 
                              padding: '10px 14px', 
                              borderRadius: '6px',
                              backgroundColor: bgColor,
                              border: `1.5px solid ${borderColor}`,
                              fontSize: '0.95rem'
                            }}
                          >
                            <strong>{opt})</strong> {q[`option${opt}`]}
                            {badge}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.9rem', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                      <div>
                        <strong>Your Answer: </strong>
                        {!isAttempted ? (
                          <span className="text-muted">Not Attempted</span>
                        ) : (
                          <span style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                            Option {studentLetter} ({q[`option${studentLetter}`] || studentLetter}) {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>Correct Answer: </strong>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                          Option {correctLetter} ({q[`option${correctLetter}`] || correctLetter})
                        </span>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <strong>Status: </strong>
                        {isCorrect ? (
                          <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Correct (+{q.marks} Marks)</span>
                        ) : isAttempted ? (
                          <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Incorrect (0 Marks)</span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>Unattempted (0 Marks)</span>
                        )}
                      </div>
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
