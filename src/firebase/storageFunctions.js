import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseClient';

/**
 * Upload an assignment submission file to Firebase Storage
 */
export const uploadSubmissionFile = async (assignmentId, studentId, file) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `submissions/${assignmentId}/${studentId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { url: downloadURL, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};
