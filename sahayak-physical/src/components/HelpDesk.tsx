import { useState, useEffect } from 'react';
import { getForumPosts, addForumPost, ForumPost } from '../utils/communityService';
import { MessageSquare, Plus, Send, Lock } from 'lucide-react';
import { User } from 'firebase/auth';

interface HelpDeskProps {
  user: User | null;
  onSignIn: () => void;
}

export function HelpDesk({ user, onSignIn }: HelpDeskProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [category, setCategory] = useState('General');
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = async () => {
    const data = await getForumPosts();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPostClick = () => {
    if (!user) {
      onSignIn();
      return;
    }
    setIsPosting(!isPosting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !user) return;
    
    await addForumPost({
      title: newTitle,
      description: newDesc,
      category,
      author: user.displayName || user.email || 'Anonymous User'
    });

    setNewTitle('');
    setNewDesc('');
    setIsPosting(false);
    fetchPosts();
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-800">
          <MessageSquare className="text-emerald-600" /> Accessibility Help Desk
        </h2>
        <button
          onClick={handleNewPostClick}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 text-xs shadow-sm transition-all"
        >
          {user ? <Plus size={16} /> : <Lock size={14} />} 
          {user ? 'New Post' : 'Sign in to Post'}
        </button>
      </div>

      {isPosting && user && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <input
            type="text"
            placeholder="Question Title (e.g. eye tracking winks)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <textarea
            placeholder="Describe your issue or tip..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 rounded-xl p-3 focus:outline-none text-xs font-semibold"
            >
              <option value="General">General</option>
              <option value="Eye/Face Tracking">Eye/Face Tracking</option>
              <option value="Voice Controls">Voice Controls</option>
              <option value="Switch Controls">Switch Controls</option>
            </select>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-sm"
            >
              <Send size={16} /> Post Question
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {posts.map(post => (
          <div key={post.id || post.title} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                {post.category}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {post.replies} replies
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-800">{post.title}</h3>
            <p className="text-sm text-slate-600">{post.description}</p>
            <div className="text-xs text-slate-500 flex justify-between mt-1">
              <span>By {post.author}</span>
              <span>{new Date(post.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

