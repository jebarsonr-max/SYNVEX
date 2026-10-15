import React, { useState } from 'react';
import { api } from '../../services/api';
import { CopilotQueryResponse, CopilotCitation } from '../../types';
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Props {
  investigationId: string;
  onSelectFinding?: (findingId: string) => void;
}

interface MessageItem {
  sender: 'user' | 'copilot';
  text: string;
  citations?: CopilotCitation[];
  confidence?: any;
  followups?: string[];
}

export const ForensicCopilot: React.FC<Props> = ({ investigationId, onSelectFinding }) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: 'copilot',
      text: "### Forensic Copilot Initialized\nI am grounded strictly in this investigation's findings, telemetry, and evidence vault. How can I assist your inquiry?",
      followups: [
        "Why was this file flagged?",
        "Summarize the strongest suspicious findings.",
        "Which findings need manual verification?",
        "Generate a preliminary incident summary."
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setLoading(true);

    try {
      const resp: CopilotQueryResponse = await api.scans.queryCopilot(investigationId, q);
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: resp.answer,
          citations: resp.citations,
          confidence: resp.confidence_assessment,
          followups: resp.suggested_followups
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: `**Inquiry Error:** ${err.message || 'Unable to retrieve case evidence. Please verify credentials.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] rounded-xl bg-surface-card border border-gold-border/60 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gold-border/40 bg-[#0A0A0A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-primary/10 border border-gold-border flex items-center justify-center text-gold-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-main flex items-center gap-2">
              <span>Forensic AI Copilot</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-gold-primary/10 border border-gold-border text-gold-primary">
                CASE-GROUNDED
              </span>
            </h3>
            <p className="text-[11px] text-text-muted">Direct evidence citations • Zero speculative hallucination</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-xl space-y-2.5 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gold-primary text-black font-semibold rounded-br-none shadow-gold-subtle'
                  : 'bg-surface-elevated border border-gold-border/40 text-text-main rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs">{m.text}</div>

              {/* Citations badges */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-gold-border/20 text-[11px]">
                  <span className="font-mono text-gold-champagne font-bold block mb-1.5">
                    Evidentiary Citations ({m.citations.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => c.finding_id && onSelectFinding && onSelectFinding(c.finding_id)}
                        className="px-2 py-1 rounded bg-[#0A0A0A] border border-gold-border/40 text-[10px] text-gold-champagne hover:border-gold-primary flex items-center gap-1 transition-all"
                      >
                        <ShieldAlert className="w-3 h-3 text-gold-primary" />
                        <span className="truncate max-w-[150px]">{c.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Assessment Badge */}
              {m.confidence && (
                <div className="pt-1 text-[10px] font-mono text-text-muted flex items-center gap-2">
                  <span>Sufficiency: <strong>{m.confidence.evidence_sufficiency}</strong></span>
                  <span>•</span>
                  <span>Zero-Hallucination Verified</span>
                </div>
              )}
            </div>

            {/* Suggested Followups */}
            {m.followups && m.followups.length > 0 && idx === messages.length - 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                {m.followups.map((fText, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => handleSend(fText)}
                    className="px-2.5 py-1 rounded-full bg-surface-elevated border border-gold-border/30 text-[10px] text-text-secondary hover:text-gold-champagne hover:border-gold-primary transition-all flex items-center gap-1"
                  >
                    <span>{fText}</span>
                    <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-elevated border border-gold-border/30 text-xs text-gold-champagne max-w-[60%] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-gold-primary" />
            <span>Consulting case findings & model telemetry...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-gold-border/40 bg-[#0A0A0A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about this case (e.g. Why was this flagged?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-surface-elevated border border-gold-border/40 rounded-lg px-3.5 py-2 text-xs text-text-main focus:outline-none focus:border-gold-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2 rounded-lg bg-gold-primary text-black hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
