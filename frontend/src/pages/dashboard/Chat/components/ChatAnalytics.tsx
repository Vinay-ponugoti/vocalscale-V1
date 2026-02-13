/**
 * Chat Analytics Tab
 * Shows usage stats and conversation insights
 */

import React from 'react';
import { BarChart3, MessageSquare, Clock, TrendingUp } from 'lucide-react';

const ChatAnalytics: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <BarChart3 size={28} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat Analytics</h2>
      <p className="text-gray-500 text-sm max-w-md mb-8">
        Track your AI conversations, token usage, and get insights into how you're leveraging VocalScale AI for growth.
      </p>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Total Chats</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">—</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">This Week</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">—</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Tokens Used</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">—</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">Analytics data will populate as you use AI chat.</p>
    </div>
  );
};

export default ChatAnalytics;
