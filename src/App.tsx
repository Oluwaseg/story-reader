import type { Session } from '@supabase/supabase-js';
import { BookOpen, LogOut, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { StoryEditor } from './components/StoryEditor';
import { StoryList } from './components/StoryList';
import { supabase } from './lib/supabase';

import type { Story } from './types/database';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as Session | null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as Session | null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchStories();
    }
  }, [session]);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to fetch stories');
      return;
    }

    setStories(data);
  };

  const handleSaveStory = async ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    const { error } = editingStory
      ? await supabase
          .from('stories')
          .update({ title, content })
          .eq('id', editingStory.id)
          .select()
      : await supabase
          .from('stories')
          .insert([{ title, content, user_id: session?.user?.id }])
          .select();

    if (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save story');
      return;
    }

    await fetchStories();
    setIsEditorOpen(false);
    setEditingStory(null);
    toast.success(
      editingStory ? 'Story updated successfully' : 'New story created'
    );
  };

  const handleDeleteStory = async (id: string) => {
    const { error } = await supabase.from('stories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
      return;
    }

    await fetchStories();
    toast.success('Story deleted successfully');
  };

  const fetchPlaybackState = async (storyId: string) => {
    const { data, error } = await supabase
      .from('playback_states')
      .select('progress')
      .eq('user_id', session?.user.id)
      .eq('story_id', storyId)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching playback state:', error);
      return 0;
    }

    return data.progress || 0;
  };

  const handlePlayStory = async (story: Story, isPaused: boolean) => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setSpeaking(true);
      toast.success('Resumed playback');
      return;
    }

    if (speaking && currentStory?.id === story.id) {
      window.speechSynthesis.pause();
      setSpeaking(false);
      toast.success('Paused playback');
      return;
    }

    window.speechSynthesis.cancel();

    setCurrentStory(story);
    setSpeaking(true);

    const progress = await fetchPlaybackState(story.id);
    const utterance = new SpeechSynthesisUtterance(
      story.content.slice(progress)
    );

    utterance.onend = async () => {
      setSpeaking(false);
      setCurrentStory(null);

      await supabase.from('playback_states').upsert(
        {
          user_id: session?.user.id,
          story_id: story.id,
          progress: story.content.length,
        },
        { onConflict: 'user_id,story_id' }
      );

      toast.success('Finished playing story');
    };

    utterance.onboundary = async (event) => {
      const currentProgress = progress + event.charIndex;
      await supabase.from('playback_states').upsert(
        {
          user_id: session?.user.id,
          story_id: story.id,
          progress: currentProgress,
        },
        { onConflict: 'user_id,story_id' }
      );
    };

    window.speechSynthesis.speak(utterance);

    await supabase.from('playback_states').upsert(
      {
        user_id: session?.user.id,
        story_id: story.id,
        progress: 0,
      },
      { onConflict: 'user_id,story_id' }
    );

    toast.success('Started playing story');
  };

  if (!session) {
    return (
      <AuthForm onSuccess={() => toast.success('Successfully signed in')} />
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 font-sans'>
      <Toaster position='top-right' />
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col sm:flex-row justify-between items-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-4 sm:mb-0'>
              Story Reader
            </h1>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => {
                  setEditingStory(null);
                  setIsEditorOpen(true);
                }}
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200'
              >
                <Plus size={20} />
                <span className='hidden sm:inline'>New Story</span>
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200'
              >
                <LogOut size={20} />
                <span className='hidden sm:inline'>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {currentStory && (
          <div className='bg-yellow-100 p-4 rounded-md mb-6 shadow-md'>
            <h2 className='text-lg font-semibold text-yellow-800'>
              Now Playing: {currentStory.title}
            </h2>
          </div>
        )}
        {stories.length > 0 ? (
          <StoryList
            stories={stories}
            onEdit={(story) => {
              setEditingStory(story);
              setIsEditorOpen(true);
            }}
            onDelete={handleDeleteStory}
            onPlay={(story, isPaused) => handlePlayStory(story, isPaused)}
          />
        ) : (
          <div className='text-center py-12'>
            <BookOpen className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-semibold text-gray-900'>
              No stories
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Get started by creating a new story.
            </p>
            <div className='mt-6'>
              <button
                onClick={() => {
                  setEditingStory(null);
                  setIsEditorOpen(true);
                }}
                className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <Plus className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
                New Story
              </button>
            </div>
          </div>
        )}
      </main>

      {isEditorOpen && (
        <StoryEditor
          story={editingStory || undefined}
          onSave={handleSaveStory}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingStory(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
