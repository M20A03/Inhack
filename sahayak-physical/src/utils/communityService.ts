// src/utils/communityService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface ForumPost {
  id?: string;
  title: string;
  description: string;
  category: string;
  author: string;
  timestamp: string;
  replies: number;
}

export interface MapPin {
  id?: string;
  title: string;
  lat: number;
  lng: number;
  accessible: boolean;
  notes: string;
}

// ── Forum / Q&A ──
export async function getForumPosts(): Promise<ForumPost[]> {
  try {
    const q = query(collection(db, 'forum'), orderBy('timestamp', 'desc'), limit(15));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
  } catch (error) {
    console.warn('Fallback to local forum mock');
    return [
      {
        id: '1',
        title: 'How to map eyes using both blink and smile?',
        description: 'Using Eye mode, but smile is easier for clicking. Anyone else tried hybrid?',
        category: 'Eye/Face Tracking',
        author: 'Ravi Verma',
        timestamp: new Date().toISOString(),
        replies: 4
      },
      {
        id: '2',
        title: 'Which external bluetooth switch is best for PWA?',
        description: 'Trying to connect a Blue2 switch. Space and Enter key map perfectly.',
        category: 'Switch Controls',
        author: 'Sarah Smith',
        timestamp: new Date().toISOString(),
        replies: 2
      }
    ];
  }
}

export async function addForumPost(post: Omit<ForumPost, 'id' | 'replies' | 'timestamp'>) {
  try {
    await addDoc(collection(db, 'forum'), {
      ...post,
      timestamp: new Date().toISOString(),
      replies: 0
    });
  } catch (error) {
    console.error('Error adding post:', error);
  }
}

// ── Accessibility Map ──
export async function getAccessibilityPins(): Promise<MapPin[]> {
  try {
    const snapshot = await getDocs(collection(db, 'pins'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapPin));
  } catch {
    return [
      { id: '1', title: 'Main Hospital Entry', lat: 28.6139, lng: 77.2090, accessible: true, notes: 'Ramp and automatic doors active.' },
      { id: '2', title: 'Metro Station Exit 2', lat: 28.6145, lng: 77.2095, accessible: false, notes: 'Elevator undergoing maintenance.' }
    ];
  }
}

export async function addAccessibilityPin(pin: Omit<MapPin, 'id'>) {
  try {
    await addDoc(collection(db, 'pins'), pin);
  } catch (error) {
    console.error('Error adding pin:', error);
  }
}
