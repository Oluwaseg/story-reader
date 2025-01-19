import {
  Book,
  ChevronDown,
  ChevronUp,
  Edit,
  Pause,
  Play,
  StopCircle,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { Story } from '../types/database';

interface StoryListProps {
  stories: Story[];
  onEdit: (story: Story) => void;
  onDelete: (id: string) => void;
  onPlay: (story: Story, isPaused: boolean) => void;
}

export function StoryList({
  stories,
  onEdit,
  onDelete,
  onPlay,
}: StoryListProps) {
  const [playingStory, setPlayingStory] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedStories, setExpandedStories] = useState<string[]>([]);

  const handlePlayPause = (story: Story) => {
    if (playingStory === story.id) {
      setIsPaused(!isPaused);
      onPlay(story, !isPaused); // Toggle pause/resume
    } else {
      setPlayingStory(story.id);
      setIsPaused(false);
      onPlay(story, false); // Start playback
    }
  };

  const handleStop = () => {
    // Cancel speech and reset states
    window.speechSynthesis.cancel();
    setPlayingStory(null);
    setIsPaused(false);
  };

  const toggleExpand = (storyId: string) => {
    setExpandedStories((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {stories.map((story) => (
        <div
          key={story.id}
          className='bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden'
        >
          <div className='p-6 flex flex-col h-full'>
            <h3 className='text-xl font-bold mb-2 text-gray-800 line-clamp-1'>
              {story.title}
            </h3>
            <div className='text-gray-600 mb-4 flex-grow'>
              <p
                className={
                  expandedStories.includes(story.id) ? '' : 'line-clamp-3'
                }
              >
                {story.content}
              </p>
              {story.content.length > 150 && (
                <button
                  onClick={() => toggleExpand(story.id)}
                  className='text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-2 flex items-center'
                >
                  {expandedStories.includes(story.id) ? (
                    <>
                      <ChevronUp size={16} className='mr-1' />
                      <span className='text-sm font-medium'>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className='mr-1' />
                      <span className='text-sm font-medium'>View More</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className='flex justify-between items-center mt-4'>
              <div className='flex gap-2'>
                {playingStory === story.id ? (
                  <>
                    <button
                      onClick={() => handlePlayPause(story)}
                      className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200'
                    >
                      {isPaused ? (
                        <Play size={20} className='animate-pulse' />
                      ) : (
                        <Pause size={20} />
                      )}
                      <span className='text-sm font-medium'>
                        {isPaused ? 'Resume' : 'Pause'}
                      </span>
                    </button>
                    <button
                      onClick={handleStop}
                      className='flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors duration-200'
                    >
                      <StopCircle size={20} />
                      <span className='text-sm font-medium'>Stop</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handlePlayPause(story)}
                    className='flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200'
                  >
                    <Book size={20} />
                    <span className='text-sm font-medium'>Play</span>
                  </button>
                )}
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => onEdit(story)}
                  className='p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors duration-200'
                  aria-label='Edit story'
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(story.id)}
                  className='p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors duration-200'
                  aria-label='Delete story'
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
