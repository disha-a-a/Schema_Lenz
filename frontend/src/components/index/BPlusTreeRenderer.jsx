import { useState, useEffect } from "react";

export default function BPlusTreeRenderer({ treeData }) {
    const [animatedNodes, setAnimatedNodes] = useState([]);

    useEffect(() => {
        if (!treeData || !treeData.root) return;
        
        // Simulating an animation effect when the tree is generated
        setAnimatedNodes([]);
        const timeout = setTimeout(() => {
            setAnimatedNodes([treeData.root]);
        }, 100);
        return () => clearTimeout(timeout);
    }, [treeData]);

    if (!treeData || !treeData.root) {
        return (
            <div className="empty-state">
                <p>No index tree generated yet. Build an index to see the B+ Tree visualization.</p>
            </div>
        );
    }

    const renderSVGNode = (node, x, y, level, index, totalSiblings) => {
        if (!node) return null;

        const boxWidth = 100 + (node.keys.length * 10);
        const boxHeight = 40;
        const xOffset = x - (boxWidth / 2);

        // Calculate spacing for children
        const childrenSpacing = 160;
        const childrenStartX = x - ((node.children?.length - 1) / 2) * childrenSpacing;

        return (
            <g key={`node-${level}-${index}-${x}-${y}`} className="tree-node" style={{transition: 'all 0.5s ease', opacity: 1}}>
                {/* Draw edges to children */}
                {node.children && node.children.map((child, i) => (
                    <line 
                        key={`edge-${level}-${i}`}
                        x1={x} y1={y + boxHeight} 
                        x2={childrenStartX + i * childrenSpacing} y2={y + 80}
                        stroke="var(--border)" 
                        strokeWidth="2"
                    />
                ))}

                {/* Draw node box */}
                <rect 
                    x={xOffset} y={y} 
                    width={boxWidth} height={boxHeight} 
                    rx="4" ry="4" 
                    fill={node.isLeaf ? "var(--primary)" : "var(--bg-deep)"}
                    stroke={node.isLeaf ? "var(--function)" : "var(--keyword)"}
                    strokeWidth="2"
                />
                
                {/* Draw keys */}
                <text 
                    x={x} y={y + 25} 
                    textAnchor="middle" 
                    fill="white" 
                    fontFamily="var(--font-mono)"
                    fontSize="14"
                >
                    {node.keys.join(" | ")}
                </text>

                {/* Recursively draw children */}
                {node.children && node.children.map((child, i) => 
                    renderSVGNode(child, childrenStartX + i * childrenSpacing, y + 80, level + 1, i, node.children.length)
                )}
            </g>
        );
    };

    return (
        <div className="bplus-tree-renderer" style={{width: '100%', height: '100%', overflow: 'auto', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)'}}>
            <svg width="100%" height="800" style={{minWidth: '800px'}}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                {/* Start rendering from the center horizontally */}
                <g transform="translate(0, 40)">
                    {renderSVGNode(treeData.root, 400, 0, 0, 0, 1)}
                </g>
            </svg>
        </div>
    );
}
