import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { InteractionSession, InteractionType } from '../types';

const USERS_COLLECTION = 'users';
const INTERACTIONS_SUBCOLLECTION = 'interactions';

export async function saveInteraction(
  userId: string,
  session: InteractionSession,
  isNewSession: boolean = false
): Promise<void> {
  if (!userId || !session.id) {
    throw new Error('Invalid userId or sessionId for persistence');
  }

  const docPath = `${USERS_COLLECTION}/${userId}/${INTERACTIONS_SUBCOLLECTION}/${session.id}`;
  try {
    const sessionDocRef = doc(db, USERS_COLLECTION, userId, INTERACTIONS_SUBCOLLECTION, session.id);
    const nowIso = new Date().toISOString();

    const payload: InteractionSession = {
      ...session,
      userId,
      updatedAt: nowIso,
      createdAt: session.createdAt || nowIso,
    };

    await setDoc(sessionDocRef, payload, { merge: true });

    // If this is a newly created session, increment the user's session counter
    if (isNewSession) {
      try {
        const userDocRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userDocRef, {
          sessionsCount: increment(1),
          updatedAt: nowIso,
        });
      } catch (countErr) {
        console.warn('Session count increment notice (non-fatal):', countErr);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    throw error;
  }
}

export async function getUserInteractions(
  userId: string,
  typeFilter?: InteractionType
): Promise<InteractionSession[]> {
  if (!userId) return [];

  const subcollPath = `${USERS_COLLECTION}/${userId}/${INTERACTIONS_SUBCOLLECTION}`;
  try {
    const interactionsCollRef = collection(db, USERS_COLLECTION, userId, INTERACTIONS_SUBCOLLECTION);
    
    // Query scoped strictly to the authenticated user's subcollection
    let q = query(interactionsCollRef, orderBy('updatedAt', 'desc'));
    
    if (typeFilter) {
      q = query(interactionsCollRef, where('type', '==', typeFilter), orderBy('updatedAt', 'desc'));
    }

    const snap = await getDocs(q);
    const results: InteractionSession[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as InteractionSession);
    });
    return results;
  } catch (error) {
    console.warn(`Fallback query without ordering for ${subcollPath}:`, error);
    try {
      // Fallback simple collection query if index is building
      const interactionsCollRef = collection(db, USERS_COLLECTION, userId, INTERACTIONS_SUBCOLLECTION);
      const snap = await getDocs(interactionsCollRef);
      const results: InteractionSession[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as InteractionSession;
        if (!typeFilter || data.type === typeFilter) {
          results.push(data);
        }
      });
      // Client-side sort by updatedAt desc
      return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, subcollPath);
      return [];
    }
  }
}

export async function getInteraction(
  userId: string,
  interactionId: string
): Promise<InteractionSession | null> {
  if (!userId || !interactionId) return null;

  const docPath = `${USERS_COLLECTION}/${userId}/${INTERACTIONS_SUBCOLLECTION}/${interactionId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, INTERACTIONS_SUBCOLLECTION, interactionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as InteractionSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
    return null;
  }
}

export async function deleteInteraction(
  userId: string,
  interactionId: string
): Promise<void> {
  if (!userId || !interactionId) return;

  const docPath = `${USERS_COLLECTION}/${userId}/${INTERACTIONS_SUBCOLLECTION}/${interactionId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, INTERACTIONS_SUBCOLLECTION, interactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}
