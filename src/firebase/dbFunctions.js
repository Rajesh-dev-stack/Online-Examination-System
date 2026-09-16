import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebaseClient';

// =====================
// EXAM FUNCTIONS
// =====================

export const createExam = async (examData) => {
  try {
    const docRef = await addDoc(collection(db, "exams"), {
      ...examData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const updateExamStatus = async (examId, newStatus) => {
  try {
    const examRef = doc(db, "exams", examId);
    await updateDoc(examRef, { status: newStatus });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteExam = async (examId) => {
  try {
    await deleteDoc(doc(db, "exams", examId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getTeacherExams = async (teacherId) => {
  try {
    const q = query(collection(db, "exams"), where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    const exams = [];
    querySnapshot.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() });
    });
    return { exams, error: null };
  } catch (error) {
    return { exams: [], error: error.message };
  }
};

export const getAvailableExamsForStudents = async () => {
  try {
    const q = query(collection(db, "exams"), where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    const exams = [];
    querySnapshot.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() });
    });
    return { exams, error: null };
  } catch (error) {
    return { exams: [], error: error.message };
  }
};

export const getExamById = async (examId) => {
  try {
    const docRef = doc(db, "exams", examId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { exam: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { exam: null, error: "Exam not found" };
  } catch (error) {
    return { exam: null, error: error.message };
  }
};

// =====================
// QUESTION FUNCTIONS
// =====================

export const addQuestionToExam = async (examId, questionData) => {
  try {
    // using questionsList subcollection as requested
    const colRef = collection(db, "exams", examId, "questionsList");
    const docRef = await addDoc(colRef, questionData);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getQuestionsForExam = async (examId) => {
  try {
    const colRef = collection(db, "exams", examId, "questionsList");
    const querySnapshot = await getDocs(colRef);
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    return { questions, error: null };
  } catch (error) {
    return { questions: [], error: error.message };
  }
};

export const deleteQuestionFromExam = async (examId, questionId) => {
  try {
    await deleteDoc(doc(db, "exams", examId, "questionsList", questionId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// =====================
// RESULT FUNCTIONS
// =====================

export const submitResult = async (resultData) => {
  try {
    const docRef = await addDoc(collection(db, "results"), {
      ...resultData,
      submittedAt: new Date().toISOString()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getStudentResults = async (studentId) => {
  try {
    const q = query(collection(db, "results"), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return { results, error: null };
  } catch (error) {
    return { results: [], error: error.message };
  }
};

export const getResultsForExam = async (examId) => {
  try {
    const q = query(collection(db, "results"), where("examId", "==", examId));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return { results, error: null };
  } catch (error) {
    return { results: [], error: error.message };
  }
};
