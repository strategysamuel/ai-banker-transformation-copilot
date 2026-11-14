import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'ai-banker-firestore-rules-tests';
let testEnv: RulesTestEnvironment;

const profile = (uid: string) => ({
  uid,
  email: `${uid}@example.test`,
  displayName: 'Banking Professional',
  photoURL: null,
  role: 'Commercial & Retail Banking Specialist',
  department: 'Digital Banking & Innovation',
  institution: 'Global Financial Services',
  transformationScore: 15,
  sessionsCount: 0,
  completedTasksCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: '2026-01-01T00:00:00.000Z',
});

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1',
      port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || 8080),
    },
  });
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/alice'), profile('alice'));
  });
});

after(async () => {
  await testEnv?.cleanup();
});

test('new user can create a profile with baseline metrics', async () => {
  const db = testEnv.authenticatedContext('charlie').firestore();
  await assertSucceeds(setDoc(doc(db, 'users/charlie'), profile('charlie')));
});

test('new user cannot initialize inflated application metrics', async () => {
  const db = testEnv.authenticatedContext('dave').firestore();
  await assertFails(setDoc(doc(db, 'users/dave'), {
    ...profile('dave'),
    transformationScore: 100,
    sessionsCount: 500,
    completedTasksCount: 500,
  }));
});

test('owner can read their own profile', async () => {
  const db = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(getDoc(doc(db, 'users/alice')));
});

test('another user cannot read a profile', async () => {
  const db = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDoc(doc(db, 'users/alice')));
});

test('owner can update permitted profile presentation fields', async () => {
  const db = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(updateDoc(doc(db, 'users/alice'), {
    displayName: 'Alice Banker',
    role: 'Relationship Manager',
    department: 'Retail Banking',
    institution: 'Example Bank',
    updatedAt: '2026-02-01T00:00:00.000Z',
  }));
});

test('owner cannot change system-managed transformation score', async () => {
  const db = testEnv.authenticatedContext('alice').firestore();
  await assertFails(updateDoc(doc(db, 'users/alice'), { transformationScore: 99 }));
});

test('owner cannot change system-managed session counters', async () => {
  const db = testEnv.authenticatedContext('alice').firestore();
  await assertFails(updateDoc(doc(db, 'users/alice'), {
    sessionsCount: 999,
    completedTasksCount: 999,
  }));
});

test('owner cannot change immutable identity fields', async () => {
  const db = testEnv.authenticatedContext('alice').firestore();
  await assertFails(updateDoc(doc(db, 'users/alice'), { uid: 'bob' }));
  await assertFails(updateDoc(doc(db, 'users/alice'), { email: 'changed@example.test' }));
});

test('user cannot write to another user profile', async () => {
  const db = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(db, 'users/alice'), { displayName: 'Intruder' }));
});
