import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

const ResultPage = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const docRef = doc(db, 'results', resultId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResult(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching result", error);
      }
      setLoading(false);
    };
    fetchResult();
  }, [resultId]);

  if (loading) return <div>Loading result...</div>;
  if (!result) return <div>Result not found.</div>;

  const isPass = result.status === 'pass';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#f3f4f6' }}>
      <div className="card text-center" style={{ maxWidth: '600px', width: '100%', padding: '40px 20px' }}>
        
        <h1 style={{ color: isPass ? 'var(--success)' : 'var(--danger)', fontSize: '3rem', marginBottom: '10px' }}>
          {isPass ? '✅ PASS' : '❌ FAIL'}
        </h1>
        
        <h2 className="mb-4">{result.examTitle}</h2>

        {/* Performance Bar */}
        <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '10px', borderRadius: '5px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${result.percentage}%`, 
            backgroundColor: isPass ? 'var(--success)' : 'var(--danger)',
            height: '100%' 
          }}></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-left" style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
          <div><strong>Total Questions:</strong> {result.totalQuestions}</div>
          <div><strong>Attempted:</strong> {result.attemptedQuestions}</div>
          <div><strong style={{ color: 'var(--success)' }}>Correct Answers:</strong> {result.correctAnswers}</div>
          <div><strong style={{ color: 'var(--danger)' }}>Wrong Answers:</strong> {result.wrongAnswers}</div>
          <div style={{ gridColumn: 'span 2', fontSize: '1.2rem', marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
            <strong>Marks Obtained:</strong> {result.obtainedMarks} / {result.totalMarks}
          </div>
          <div style={{ gridColumn: 'span 2', fontSize: '1.2rem' }}>
            <strong>Percentage:</strong> {result.percentage}%
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <strong>Time Taken:</strong> {result.timeTaken}
          </div>
        </div>

        <Link to="/student/dashboard" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultPage;
