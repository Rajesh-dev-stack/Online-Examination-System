import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseClient';

/**
 * Register a new user and save their profile in Firestore.
 */
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      email: user.email,
      createdAt: new Date().toISOString()
    });
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Login an existing user and fetch their profile.
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user role and details from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return { user: userCredential.user, userData: userDoc.data(), error: null };
    } else {
      return { user: null, userData: null, error: "User profile not found in database." };
    }
  } catch (error) {
    return { user: null, userData: null, error: error.message };
  }
};

/**
 * Logout current user.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
