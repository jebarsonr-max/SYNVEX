import React, { useState, useRef, useEffect, useMemo } from 'react';
import { EvidenceGraph, GraphNode, GraphEdge } from '../../types';
import {
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ShieldAlert,
  Cpu,
  Layers,
  FileCheck2,
  ExternalLink,
  X
} from 'lucide-react';

interface Props {
  graphData: EvidenceGraph;
  onSelectFinding?: (findingId: string) => void;
}

export const EvidenceRelationshipGraph: React.FC<Props> = ({ graphData, onSelectFinding }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate deterministic layout positions based on node index and type
  const layoutNodes = useMemo(() => {
    const nodes = graphData.nodes;
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const targetNode = nodes.find(n => n.type === 'target');
    const findingNodes = nodes.filter(n => n.type === 'finding');
    const analyzerNodes = nodes.filter(n => n.type === 'analyzer');
    const entityNodes = nodes.filter(n => n.type === 'entity');
    const otherNodes = nodes.filter(n => !['target', 'finding', 'analyzer', 'entity'].includes(n.type));

    const positions: Record<string, { x: number; y: number }> = {};

    // Center target
    if (targetNode) {
      positions[targetNode.id] = { x: centerX, y: centerY };
    }

    // Findings in inner circle
    const fRadius = 160;
    findingNodes.forEach((n, idx) => {
      const angle = (idx / Math.max(1, findingNodes.length)) * 2 * Math.PI - Math.PI / 2;
      positions[n.id] = {
        x: centerX + fRadius * Math.cos(angle),
        y: centerY + fRadius * Math.sin(angle)
      };
    });

    // Analyzers on top left arc
    const aRadius = 240;
    analyzerNodes.forEach((n, idx) => {
      const angle = Math.PI + (idx / Math.max(1, analyzerNodes.length)) * (Math.PI / 2);
      positions[n.id] = {
        x: centerX + aRadius * Math.cos(angle),
        y: centerY + aRadius * Math.sin(angle) * 0.8
      };
    });

    // Entities on outer right arc
    const eRadius = 250;
    entityNodes.forEach((n, idx) => {
      const angle = -Math.PI / 3 + (idx / Math.max(1, entityNodes.length)) * (2 * Math.PI / 3);
      positions[n.id] = {
        x: centerX + eRadius * Math.cos(angle),
        y: centerY + eRadius * Math.sin(angle)
      };
    });

    // Others distributed
    otherNodes.forEach((n, idx) => {
      positions[n.id] = {
        x: centerX - 220 + (idx * 60) % 400,
        y: centerY + 190
      };
    });

    return positions;
  }, [graphData]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filtered nodes
  const filteredNodes = graphData.nodes.filter(n => {
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || (n.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = graphData.edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  // Node styling helper
  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'target') return { bg: '#D4AF62', border: '#F4D995', text: '#000000' };
    if (node.type === 'finding') {
      if (node.severity === 'CRITICAL' || node.severity === 'HIGH') return { bg: '#450a0a', border: '#ef4444', text: '#fca5a5' };
      if (node.severity === 'MEDIUM') return { bg: '#451a03', border: '#f59e0b', text: '#fcd34d' };
      return { bg: '#064e3b', border: '#10b981', text: '#6ee7b7' };
    }
    if (node.type === 'analyzer') return { bg: '#082f49', border: '#38bdf8', text: '#bae6fd' };
    if (node.type === 'entity') return { bg: '#142918', border: '#D4AF62', text: '#F4D995' };
    return { bg: '#18181b', border: '#52525b', text: '#e4e4e7' };
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-3.5 rounded-xl bg-surface-card border border-gold-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes or entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-elevated border border-gold-border/40 rounded-md py-1.5 pl-8 pr-2.5 text-xs text-text-main focus:outline-none focus:border-gold-primary"
          />
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'target', 'finding', 'analyzer', 'entity'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                typeFilter === t
                  ? 'bg-gold-primary text-black'
                  : 'bg-surface-elevated border border-gold-border/30 text-text-secondary hover:text-text-main'
              }`}
            >
              {t === 'ALL' ? 'All Nodes' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
            className="p-1.5 rounded bg-surface-elevated border border-gold-border/30 text-text-secondary hover:text-gold-champagne"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1.5 text-text-muted">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded bg-surface-elevated border border-gold-border/30 text-text-secondary hover:text-gold-champagne"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1.5 rounded bg-surface-elevated border border-gold-border/30 text-text-secondary hover:text-gold-champagne ml-1"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Container */}
      <div className="relative w-full h-[520px] rounded-xl bg-[#090909] border border-gold-border/60 overflow-hidden shadow-2xl select-none">
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none" />

        {/* Legend */}
        <div className="absolute top-3 left-3 z-10 px-3 py-2 rounded-lg bg-[#0F0F0F]/90 border border-gold-border/40 text-[10px] space-y-1 backdrop-blur pointer-events-none">
          <span className="font-mono text-text-muted block uppercase">Graph Legend</span>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold-primary" /> <span>Target Evidence</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> <span>Elevated Finding</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> <span>Analyzer Engine</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> <span>Extracted Entity</span></div>
        </div>

        {/* SVG Graph View */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 800 500"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="20"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(212, 175, 98, 0.4)" />
              </marker>
            </defs>

            {/* Relationship Edges */}
            {filteredEdges.map((edge) => {
              const src = layoutNodes[edge.source];
              const tgt = layoutNodes[edge.target];
              if (!src || !tgt) return null;

              const isCross = edge.relation_type === 'cross_correlated';
              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isCross ? '#F59E0B' : 'rgba(212, 175, 98, 0.35)'}
                    strokeWidth={edge.weight > 1 ? 1.8 : 1.2}
                    strokeDasharray={edge.is_verified ? undefined : '4 4'}
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 4}
                      fill="#71717A"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Interactive Nodes */}
            {filteredNodes.map((node) => {
              const pos = layoutNodes[node.id] || { x: 400, y: 250 };
              const colors = getNodeColor(node);
              const isSelected = selectedNode?.id === node.id;
              const radius = node.type === 'target' ? 26 : node.type === 'finding' ? 20 : 16;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke="#F4D995"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Main Node Body */}
                  <circle
                    r={radius}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Icon or Monogram */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={colors.text}
                    fontSize={node.type === 'target' ? 12 : 9}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {node.type === 'target' ? 'EVD' : node.type === 'finding' ? '!' : node.type === 'analyzer' ? 'AI' : 'ENT'}
                  </text>

                  {/* Label Text below node */}
                  <text
                    y={radius + 14}
                    textAnchor="middle"
                    fill="#E4E4E7"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="pointer-events-none select-none"
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-80 bg-[#0F0F0F]/95 border border-gold-border rounded-xl p-4 shadow-2xl backdrop-blur flex flex-col justify-between z-20 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gold-border/30">
                <span className="text-[10px] font-mono uppercase text-gold-primary tracking-wider">
                  {selectedNode.type} NODE DETAILS
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-text-muted hover:text-text-main p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <h4 className="font-bold text-sm text-text-main">{selectedNode.label}</h4>

                {selectedNode.category && (
                  <p className="text-[11px] text-text-secondary">
                    <span className="text-text-muted">Category:</span> {selectedNode.category}
                  </p>
                )}

                {selectedNode.severity && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[11px]">Severity:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedNode.severity === 'CRITICAL' || selectedNode.severity === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' :
                      selectedNode.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {selectedNode.severity}
                    </span>
                  </div>
                )}

                {selectedNode.score_contribution !== undefined && (
                  <p className="text-[11px] font-mono text-gold-champagne">
                    Score Contribution: +{selectedNode.score_contribution} pts
                  </p>
                )}

                {/* Raw Details JSON */}
                {selectedNode.details && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">Evidentiary Metadata</span>
                    <pre className="p-2.5 rounded bg-surface-elevated border border-gold-border/20 text-[10px] font-mono text-text-secondary overflow-x-auto max-h-48 whitespace-pre-wrap">
                      {JSON.stringify(selectedNode.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {selectedNode.type === 'finding' && selectedNode.details?.finding_id && onSelectFinding && (
              <button
                onClick={() => onSelectFinding(selectedNode.details.finding_id)}
                className="w-full py-2 rounded bg-gold-primary text-black font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Inspect Finding Evidence</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
