import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Smile, 
  Flame, 
  BookOpen, 
  Tag, 
  TrendingUp, 
  Sparkles,
  Calendar
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface AnalyticsViewProps {
  entries: JournalEntry[];
  onSelectTag: (tag: string) => void;
  selectedTag: string | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  entries,
  onSelectTag,
  selectedTag,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'mr') || 'en';

  // Compute metrics
  const totalCount = entries.length;
  const avgMood = totalCount
    ? (entries.reduce((acc, curr) => acc + curr.moodScore, 0) / totalCount).toFixed(1)
    : '0.0';

  // Compute streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    const daySet = new Set(
      sorted.map((e) => new Date(e.createdAt).toDateString())
    );
    return daySet.size;
  };

  const streakDays = calculateStreak();

  // Aggregate tags
  const tagCounts: Record<string, number> = {};
  entries.forEach((e) => {
    (e.tags || []).forEach((tag) => {
      const cleaned = tag.trim();
      if (cleaned) {
        tagCounts[cleaned] = (tagCounts[cleaned] || 0) + 1;
      }
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Prepare chart data (chronological)
  const chartData = [...entries]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((e) => {
      const d = new Date(e.createdAt);
      return {
        timestamp: e.createdAt,
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: d.toLocaleString(),
        moodScore: e.moodScore,
        moodLabel: e.moodLabel,
        tags: e.tags,
      };
    });

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-3 shadow-xl text-stone-100 text-xs space-y-1">
          <div className="font-semibold text-amber-400">{data.date}</div>
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-300">{t('moodScoreLabel')}:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {data.moodScore}/10
            </span>
          </div>
          <div className="text-stone-300">
            <span className="text-stone-400">{t('moodLabelText')}: </span>
            <span className="font-medium text-stone-200">{data.moodLabel}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Total Entries */}
        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/90 border border-stone-800 text-stone-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {t('totalEntries')}
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-100 mt-1">
              {totalCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Average Mood Score */}
        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/90 border border-stone-800 text-stone-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {t('averageMood')}
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1">
              {avgMood}
              <span className="text-stone-500 text-sm font-normal"> / 10</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Smile className="w-6 h-6" />
          </div>
        </div>

        {/* Journaling Streak */}
        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/90 border border-stone-800 text-stone-100 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {t('streakDays')}
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 mt-1">
              {streakDays}{' '}
              <span className="text-stone-500 text-sm font-normal">{t('days')}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Mood Score Trajectory Chart */}
      <div 
        id="mood-analytics-chart-card"
        className="bg-stone-900/90 rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-xl text-stone-100 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif-display text-stone-100">
                {t('moodTrendOverTime')}
              </h3>
              <p className="text-xs text-stone-400">
                {currentLang === 'mr'
                  ? 'प्रत्येक नोंदीनुसार भावनिक आलेख'
                  : 'Longitudinal sentiment evaluation generated by Gemini'}
              </p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#78716c" 
                  tick={{ fill: '#a8a29e', fontSize: 11 }} 
                  axisLine={{ stroke: '#44403c' }}
                />
                <YAxis 
                  domain={[1, 10]} 
                  ticks={[2, 4, 6, 8, 10]} 
                  stroke="#78716c" 
                  tick={{ fill: '#a8a29e', fontSize: 11 }} 
                  axisLine={{ stroke: '#44403c' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="moodScore"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                  dot={{ r: 4, fill: '#f59e0b', stroke: '#1c1917', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-stone-500 text-sm">
            {t('noEntriesFound')}
          </div>
        )}
      </div>

      {/* Smart Tags Filter & Cloud */}
      {sortedTags.length > 0 && (
        <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-xl text-stone-100 space-y-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold font-serif-display text-stone-100">
              {t('frequentTags')}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onSelectTag('')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                !selectedTag
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              {t('allTags')} ({totalCount})
            </button>

            {sortedTags.map(([tag, count]) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/30'
                      : 'bg-stone-800/90 hover:bg-stone-700 text-amber-200 border border-stone-700/80'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-stone-950 text-amber-400' : 'bg-stone-900 text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
