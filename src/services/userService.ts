import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docPath = `${USERS_COLLECTION}/${uid}`;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function syncUserProfile(user: User): Promise<UserProfile> {
  const docPath = `${USERS_COLLECTION}/${user.uid}`;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const snap = await getDoc(userDocRef);
    const nowIso = new Date().toISOString();

    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Banking Professional',
        photoURL: user.photoURL || null,
        role: 'Commercial & Retail Banking Specialist',
        department: 'Digital Banking & Innovation',
        institution: 'Global Financial Services',
        transformationScore: 15,
        sessionsCount: 0,
        completedTasksCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLoginAt: nowIso,
      };

      await setDoc(userDocRef, newProfile);
      return newProfile;
    } else {
      const existingData = snap.data() as UserProfile;
      const updatedProfile: Partial<UserProfile> = {
        displayName: user.displayName || existingData.displayName || 'Banking Professional',
        photoURL: user.photoURL || existingData.photoURL || null,
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      };

      await updateDoc(userDocRef, updatedProfile);
      return { ...existingData, ...updatedProfile };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${uid}`;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(userDocRef, updatedData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
