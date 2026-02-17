/**
 * ImageCard Component
 * Displays AI-generated images with size selector, download, lightbox,
 * and a social media caption / hashtags / ideas panel.
 */

import { useState, useCallback } from 'react';
import {
  Download,
  Expand,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Copy,
  Hash,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { chatApi } from '../../../../api/chat';
import type { GeneratedImage, SocialContent } from '../../../../types/chat';

// Preset categories for the size selector
const PRESET_CATEGORIES: Record<string, { label: string; presets: string[] }> = {
  social: {
    label: 'Social Media',
    presets: [
      'instagram_square',
      'instagram_story',
      'instagram_landscape',
      'facebook_post',
      'facebook_cover',
      'twitter_post',
      'linkedin_post',
      'tiktok_cover',
    ],
  },
  video: {
    label: 'Video',
    presets: ['youtube_thumbnail'],
  },
  general: {
    label: 'General',
    presets: ['square', 'landscape', 'portrait'],
  },
};

const PRESET_LABELS: Record<string, string> = {
  instagram_square: 'Instagram Post',
  instagram_story: 'Instagram Story',
  instagram_landscape: 'Instagram Landscape',
  facebook_post: 'Facebook Post',
  facebook_cover: 'Facebook Cover',
  twitter_post: 'Twitter/X Post',
  linkedin_post: 'LinkedIn Post',
  youtube_thumbnail: 'YouTube Thumbnail',
  tiktok_cover: 'TikTok/Reels',
  square: 'Square (1:1)',
  landscape: 'Landscape (16:9)',
  portrait: 'Portrait (9:16)',
};

interface ImageCardProps {
  images: GeneratedImage[];
  generationId?: string;
  availablePresets?: Record<string, string>;
  sessionId?: string;
  socialContent?: SocialContent | null;
}

// ─── Small copy button used inside the caption panel ────────────────────────
const CopyBtn = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all',
        copied
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

// ─── Caption / Hashtags / Ideas panel ───────────────────────────────────────
const SocialContentPanel = ({ content }: { content: SocialContent }) => {
  const [activeTab, setActiveTab] = useState<'caption' | 'hashtags' | 'ideas'>('caption');

  const tabs: Array<{ key: typeof activeTab; label: string; icon: React.ReactNode; available: boolean }> = [
    { key: 'caption', label: 'Caption', icon: <FileText size={13} />, available: !!content.caption },
    { key: 'hashtags', label: 'Hashtags', icon: <Hash size={13} />, available: !!content.hashtags },
    { key: 'ideas', label: 'Ideas', icon: <Lightbulb size={13} />, available: !!content.ideas },
  ];

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.filter(t => t.available).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center px-3 gap-2">
          {activeTab === 'caption' && content.caption && (
            <CopyBtn text={content.caption} label="Copy caption" />
          )}
          {activeTab === 'hashtags' && content.hashtags && (
            <CopyBtn text={content.hashtags} label="Copy hashtags" />
          )}
          {activeTab === 'caption' && content.caption && content.hashtags && (
            <CopyBtn
              text={`${content.caption}\n\n${content.hashtags}`}
              label="Copy all"
            />
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'caption' && content.caption && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content.caption}
          </p>
        )}

        {activeTab === 'hashtags' && content.hashtags && (
          <div className="flex flex-wrap gap-1.5">
            {content.hashtags
              .split(/\s+/)
              .filter(t => t.startsWith('#'))
              .map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            {/* If no hashtags found with #, just show raw text */}
            {!content.hashtags.includes('#') && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.hashtags}</p>
            )}
          </div>
        )}

        {activeTab === 'ideas' && content.ideas && (
          <ul className="space-y-2">
            {content.ideas
              .split('\n')
              .filter(line => line.trim())
              .map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {line.replace(/^[•\-\d.]+\s*/, '')}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ─── Main ImageCard ──────────────────────────────────────────────────────────
const ImageCard = ({ images, generationId, availablePresets, sessionId, socialContent }: ImageCardProps) => {
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<GeneratedImage[]>(images);

  const generatedPresets = new Set(allImages.map(img => img.preset));

  const handleDownload = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocalscale-${image.preset}-${image.dimensions}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

  const handleRegenerate = useCallback(async (presetName: string) => {
    if (!generationId || !sessionId || regenerating) return;

    setRegenerating(presetName);
    try {
      const result = await chatApi.regenerateImage(
        generationId,
        sessionId,
        [presetName],
      );

      if (result.images && result.images.length > 0) {
        setAllImages(prev => [...prev, ...result.images]);
      }
    } catch (err) {
      console.error('Regeneration failed:', err);
    } finally {
      setRegenerating(null);
    }
  }, [generationId, sessionId, regenerating]);

  if (allImages.length === 0) return null;

  return (
    <>
      {/* Image Grid */}
      <div className="mt-4 space-y-3">
        <div
          className={cn(
            'grid gap-3',
            allImages.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2'
          )}
        >
          {allImages.map((image, idx) => (
            <div
              key={`${image.preset}-${idx}`}
              className="group/img relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={image.url}
                alt={`Generated ${image.preset_label || image.preset}`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-200 flex items-end">
                <div className="w-full p-3 translate-y-full group-hover/img:translate-y-0 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white text-sm font-medium">
                        {image.preset_label || PRESET_LABELS[image.preset] || image.preset}
                      </span>
                      <span className="text-white/70 text-xs ml-2">{image.dimensions}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLightboxImage(image)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Expand size={13} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(image)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Content Panel (caption / hashtags / ideas) */}
        {socialContent && (socialContent.caption || socialContent.hashtags || socialContent.ideas) && (
          <SocialContentPanel content={socialContent} />
        )}

        {/* Size Selector Toggle */}
        {generationId && (
          <button
            onClick={() => setShowSizeSelector(!showSizeSelector)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ImageIcon size={14} />
            <span>Generate more sizes</span>
            {showSizeSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Size Selector Panel */}
        {showSizeSelector && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            {Object.entries(PRESET_CATEGORIES).map(([categoryKey, category]) => (
              <div key={categoryKey}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {category.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.presets.map(presetName => {
                    const isGenerated = generatedPresets.has(presetName);
                    const isRegenerating = regenerating === presetName;
                    const label = PRESET_LABELS[presetName] || presetName;

                    return (
                      <button
                        key={presetName}
                        onClick={() => !isGenerated && !isRegenerating && handleRegenerate(presetName)}
                        disabled={isGenerated || isRegenerating}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                          isGenerated
                            ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
                            : isRegenerating
                            ? 'bg-blue-50 border-blue-200 text-blue-600 cursor-wait'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 cursor-pointer'
                        )}
                      >
                        {isGenerated && <Check size={12} className="text-green-600" />}
                        {isRegenerating && <Loader2 size={12} className="animate-spin" />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="absolute top-4 left-4 text-white">
            <p className="text-sm font-medium">
              {lightboxImage.preset_label || PRESET_LABELS[lightboxImage.preset] || lightboxImage.preset}
            </p>
            <p className="text-xs text-white/70">{lightboxImage.dimensions}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(lightboxImage);
            }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={16} />
            Download
          </button>

          <img
            src={lightboxImage.url}
            alt={`Generated ${lightboxImage.preset}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImageCard;
