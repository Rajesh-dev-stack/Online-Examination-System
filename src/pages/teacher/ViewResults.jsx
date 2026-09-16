import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTeacherExams, getResultsForExam } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const ViewResults = () => {
  const [searchParams] = useSearchParams();
  const preselectedExamId = searchParams.get('examId');
  
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(preselectedExamId || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchExams = async () => {
      const { exams: fetchedExams, error } = await getTeacherExams(user.uid);
      if (!error) {
        setExams(fetchedExams);
        if (preselectedExamId && fetchedExams.some(e => e.id === preselectedExamId)) {
          fetchResults(preselectedExamId);
        } else if (fetchedExams.length > 0 && !preselectedExamId) {
          setSelectedExamId(fetchedExams[0].id);
          fetchResults(fetchedExams[0].id);
        }
      }
      setLoading(false);
    };
    fetchExams();
  }, [user.uid]);

  const fetchResults = async (examId) => {
    setResultsLoading(true);
    const { results: fetchedResults, error } = await getResultsForExam(examId);
    if (error) {
      toast.error('Failed to fetch results');
    } else {
      setResults(fetchedResults);
    }
    setResultsLoading(false);
  };

  const handleExamChange = (e) => {
    const eid = e.target.value;
    setSelectedExamId(eid);
    fetchResults(eid);
  };

  const downloadCSV = () => {
    if (results.length === 0) return;
    const headers = ['Student Name', 'Roll Number', 'Marks', 'Total Marks', 'Percentage', 'Status', 'Time Taken'];
    const rows = results.map(r => [
      r.studentName, 
      r.rollNumber, 
      r.obtainedMarks, 
      r.totalMarks, 
      `${r.percentage}%`, 
      r.status.toUpperCase(),
      r.timeTaken
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "results.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Compute Class Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const highest = results.length > 0 ? Math.max(...results.map(r => r.obtainedMarks)) : 0;
  const lowest = results.length > 0 ? Math.min(...results.map(r => r.obtainedMarks)) : 0;
  const average = results.length > 0 ? (results.reduce((acc, r) => acc + r.obtainedMarks, 0) / results.length).toFixed(2) : 0;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">View Results</h2>
      
      <div className="card mb-4">
        <div className="d-flex justify-between align-center">
          <div className="form-group" style={{ marginBottom: 0, minWidth: '300px' }}>
            <label>Select Exam</label>
            <select className="form-control" value={selectedExamId} onChange={handleExamChange}>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title} ({exam.subject})</option>
              ))}
            </select>
          </div>
          <button className="btn btn-success" onClick={downloadCSV} disabled={results.length === 0}>
            Download CSV
          </button>
        </div>
      </div>

      {resultsLoading ? (
        <div>Loading results...</div>
      ) : results.length === 0 ? (
        <div className="card">
          <p>No results found for this exam yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="card text-center" style={{ padding: '15px' }}>
              <h4>{results.length}</h4><p className="text-muted text-sm">Total Appeared</p>
            </div>
            <div className="card text-center" style={{ padding: '15px' }}>
              <h4 style={{ color: 'var(--success)' }}>{passed} Passed</h4><p className="text-muted text-sm">{((passed/results.length)*100).toFixed(1)}%</p>
            </div>
            <div className="card text-center" style={{ padding: '15px' }}>
              <h4 style={{ color: 'var(--primary)' }}>{highest}</h4><p className="text-muted text-sm">Highest Marks</p>
            </div>
            <div className="card text-center" style={{ padding: '15px' }}>
              <h4 style={{ color: 'var(--warning)' }}>{average}</h4><p className="text-muted text-sm">Average Marks</p>
            </div>
          </div>

          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px' }}>Student</th>
                    <th style={{ padding: '12px' }}>Roll Number</th>
                    <th style={{ padding: '12px' }}>Marks</th>
                    <th style={{ padding: '12px' }}>Percentage</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}><strong>{result.studentName}</strong></td>
                      <td style={{ padding: '12px' }}>{result.rollNumber}</td>
                      <td style={{ padding: '12px' }}>{result.obtainedMarks} / {result.totalMarks}</td>
                      <td style={{ padding: '12px' }}>{result.percentage}%</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${result.status === 'pass' ? 'badge-active' : 'badge-completed'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{result.timeTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewResults;
