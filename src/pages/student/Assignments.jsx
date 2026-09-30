import { useState, useEffect } from 'react';
import { getStudentAssignments, getStudentSubmissions } from '../../firebase/dbFunctions';
import { uploadSubmissionFile } from '../../firebase/storageFunctions';
import { submitAssignment } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const Assignments = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [assRes, subRes] = await Promise.all([
        getStudentAssignments(user.course, user.section),
        getStudentSubmissions(user.uid)
      ]);
      
      if (!assRes.error) setAssignments(assRes.assignments);
      if (!subRes.error) setSubmissions(subRes.submissions);
      
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    
    setSubmitting(true);
    toast('Uploading file...');
    
    const { url, error: uploadError } = await uploadSubmissionFile(selectedAssignment.id, user.uid, file);
    
    if (uploadError) {
      toast.error(`Upload failed: ${uploadError}`);
      setSubmitting(false);
      return;
    }
    
    const submissionData = {
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      studentId: user.uid,
      studentName: user.name,
      rollNumber: user.rollNumber,
      fileURL: url,
      fileName: file.name,
      fileType: file.type,
      status: 'submitted',
      marks: null,
      feedback: ''
    };
    
    const { error: dbError } = await submitAssignment(submissionData);
    
    if (dbError) {
      toast.error(`Database error: ${dbError}`);
    } else {
      toast.success('Assignment submitted successfully!');
      setSubmissions([...submissions, { ...submissionData, id: 'temp' }]); // optimistic update
      setSelectedAssignment(null);
      setFile(null);
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Assignments</h2>
      
      {assignments.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <h3 className="text-muted" style={{ margin: 0 }}>No assignments available at the moment.</h3>
          <p className="text-muted mt-2">Check back later for new assignments from your teachers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {assignments.map(a => {
            const submission = submissions.find(s => s.assignmentId === a.id);
            const isSubmitted = !!submission;
            
            return (
              <div key={a.id} className="card">
                <div className="d-flex justify-between align-center mb-2">
                  <h3>{a.title}</h3>
                  {isSubmitted ? (
                    <span className={`badge ${submission.status === 'graded' ? 'badge-active' : 'badge-upcoming'}`}>
                      {submission.status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ backgroundColor: '#ca8a04', color: 'white' }}>PENDING</span>
                  )}
                </div>
                <p className="text-muted mb-2">{a.subject} | Due: {new Date(a.dueDate).toLocaleString()}</p>
                <p><strong>Total Marks:</strong> {a.totalMarks}</p>
                
                <button 
                  className={`btn mt-3 ${isSubmitted ? 'btn-secondary' : 'btn-primary'}`}
                  style={isSubmitted ? { backgroundColor: '#9ca3af', color: 'white' } : {}}
                  onClick={() => setSelectedAssignment(a)}
                  disabled={isSubmitted && submission.status === 'graded'}
                >
                  {isSubmitted ? 'View Submission' : 'View & Submit'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal / View */}
      {selectedAssignment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-between align-center mb-4">
              <h2 style={{ margin: 0 }}>{selectedAssignment.title}</h2>
              <button className="btn btn-danger" onClick={() => setSelectedAssignment(null)}>Close</button>
            </div>
            
            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              <h4>Instructions:</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{selectedAssignment.description}</p>
            </div>

            <div className="mb-4">
              <h4>Questions:</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '6px' }}>
                {selectedAssignment.questions && selectedAssignment.questions.map((q, idx) => (
                  <div key={idx} className="mb-2">
                    <strong>Q{idx+1}:</strong> {q.questionText} <span className="text-muted">[{q.marks} Marks]</span>
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              const sub = submissions.find(s => s.assignmentId === selectedAssignment.id);
              if (sub) {
                return (
                  <div style={{ backgroundColor: '#dcfce7', padding: '15px', borderRadius: '6px' }}>
                    <h4 style={{ color: '#166534' }}>Already Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</h4>
                    <p><strong>File:</strong> <a href={sub.fileURL} target="_blank" rel="noreferrer">{sub.fileName}</a></p>
                    {sub.status === 'graded' && (
                      <div className="mt-2">
                        <p><strong>Marks:</strong> {sub.marks} / {selectedAssignment.totalMarks}</p>
                        <p><strong>Feedback:</strong> {sub.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label style={{ display: 'block', padding: '30px', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                      <br/>
                      {file ? file.name : 'Click to select PDF, JPEG, or PNG (Max 10MB)'}
                      <input type="file" accept=".pdf, .jpeg, .jpg, .png" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                  </div>
                  <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={submitting}>
                    {submitting ? 'Uploading...' : 'Submit Assignment'}
                  </button>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
