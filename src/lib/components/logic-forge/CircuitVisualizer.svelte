<script lang="ts">
  import type { LogicAST } from '$lib/types/logic-forge';
  import { getDictionary } from '$lib/dictionaries';
  import { toPng, toSvg } from 'html-to-image';
  import { SvelteSet, SvelteMap } from 'svelte/reactivity';

  export let lang: string = 'en';
  export let ast: LogicAST | null = null;

  $: dict = (getDictionary(lang) as any)?.tools?.logicForge as any;

  let containerWidth = 0;
  let containerHeight = 0;

  // Actual content dimensions
  let graphWidth = 0;
  let graphHeight = 0;

  // State for interactivity
  let inputStates: Record<string, boolean> = {};

  interface VisualNode {
    id: string;
    type: string;
    label?: string;
    x: number;
    y: number;
    value: boolean;
    inputs: string[]; // IDs of input nodes
  }

  interface VisualEdge {
    from: string;
    to: string;
    active: boolean;
  }

  let nodes: VisualNode[] = [];
  let edges: VisualEdge[] = [];

  // Layout Constants
  const LAYER_SPACING = 120;
  const NODE_SPACING = 80; // Increased for better touch targets
  const PADDING_X = 60;
  const PADDING_Y = 60;

  function buildGraph(root: LogicAST) {
      if (!root) return;

      const newNodes: VisualNode[] = [];
      const newEdges: VisualEdge[] = [];
      let idCounter = 0;

      // Identify unique variables first to stabilize input order
      const vars = new SvelteSet<string>();
      function collectVars(n: LogicAST) {
          if (n.type === 'VAR') vars.add(n.name);
          else if (n.type === 'NOT') collectVars(n.operand);
          else if ('left' in n) { collectVars(n.left); collectVars(n.right); }
      }
      collectVars(root);
      const sortedVars = Array.from(vars).sort();

      // Initialize input states if new vars appear
      sortedVars.forEach(v => {
          if (inputStates[v] === undefined) inputStates[v] = false;
      });

      // Build Graph (Post-order traversal to put inputs at bottom/left, root at top/right)
      // Actually for circuit, we want Inputs -> Gates -> Output

      // We assign layers. Inputs are Layer 0.
      const nodeLayers = new SvelteMap<string, number>();

      function traverse(node: LogicAST): string {
          // If we want to reuse shared sub-expressions, we'd need a more complex equality check.
          // For now, simple tree expansion with unique IDs per node instance is safer for visualizer
          // unless we implement deep comparison. Let's do unique IDs.
          const id = `node_${idCounter++}`;

          let myLayer = 0;
          let myInputs: string[] = [];
          let label = node.type;
          let value = false;

          if (node.type === 'VAR') {
              label = node.name;
              value = inputStates[node.name];
          } else if (node.type === 'CONST') {
              label = node.value ? '1' : '0';
              value = node.value;
          } else if (node.type === 'NOT') {
              const childId = traverse(node.operand);
              myInputs.push(childId);
              myLayer = (nodeLayers.get(childId) || 0) + 1;
              newEdges.push({ from: childId, to: id, active: false });
          } else if ('left' in node) {
              const lId = traverse(node.left);
              const rId = traverse(node.right);
              myInputs.push(lId, rId);
              myLayer = Math.max(nodeLayers.get(lId) || 0, nodeLayers.get(rId) || 0) + 1;
              newEdges.push({ from: lId, to: id, active: false });
              newEdges.push({ from: rId, to: id, active: false });
          }

          nodeLayers.set(id, myLayer);
          newNodes.push({ id, type: node.type, label, x: 0, y: 0, value, inputs: myInputs });
          return id;
      }

      traverse(root);

      // Evaluate logic for current state
      // We can just use the engine's evaluate function on the AST?
      // But we need intermediate values.
      // Let's re-evaluate locally based on graph structure.
      // Topological sort is implicit in our post-order traversal (nodes built children first)
      // So iterate newNodes in order.

      const nodeValues = new SvelteMap<string, boolean>();

      newNodes.forEach(n => {
          let val = false;
          if (n.type === 'VAR') val = inputStates[n.label || ''];
          else if (n.type === 'CONST') val = n.label === '1';
          else {
              const inputs = n.inputs.map(i => nodeValues.get(i) || false);
              if (n.type === 'NOT') val = !inputs[0];
              else if (n.type === 'AND') val = inputs[0] && inputs[1];
              else if (n.type === 'OR') val = inputs[0] || inputs[1];
              else if (n.type === 'XOR') val = inputs[0] !== inputs[1];
              else if (n.type === 'NAND') val = !(inputs[0] && inputs[1]);
              else if (n.type === 'NOR') val = !(inputs[0] || inputs[1]);
              else if (n.type === 'XNOR') val = inputs[0] === inputs[1];
              else if (n.type === 'IMPLIES') val = !inputs[0] || inputs[1];
              else if (n.type === 'EQUIV') val = inputs[0] === inputs[1];
          }
          nodeValues.set(n.id, val);
          n.value = val;
      });

      // Update edge activity
      newEdges.forEach(e => {
          e.active = nodeValues.get(e.from) || false;
      });

      // Layout Layout
      // Group by layer
      const layers: Record<number, VisualNode[]> = {};
      let maxLayer = 0;
      newNodes.forEach(n => {
          const l = nodeLayers.get(n.id) || 0;
          maxLayer = Math.max(maxLayer, l);
          if (!layers[l]) layers[l] = [];
          layers[l].push(n);
      });

      // Assign X, Y
      // Reverse layers so Output is Right, Input is Left?
      // Typically: Inputs Left (Layer 0 in graph terms usually means leaves?)
      // Wait, my logic: Leaves (Inputs) have layer 0. Root has max layer.
      // So Inputs -> Left, Root -> Right.
      // X = layer * SPACING + padding.

      // Determine content dimensions
      const totalLayers = maxLayer + 1;
      let maxNodesInLayer = 0;
      Object.values(layers).forEach(l => maxNodesInLayer = Math.max(maxNodesInLayer, l.length));

      graphWidth = Math.max(containerWidth, totalLayers * LAYER_SPACING + PADDING_X * 2);
      graphHeight = Math.max(containerHeight, maxNodesInLayer * NODE_SPACING + PADDING_Y * 2);

      // Center in graph area
      const contentW = totalLayers * LAYER_SPACING;
      const startX = Math.max(PADDING_X, (graphWidth - contentW) / 2);

      Object.keys(layers).forEach(k => {
          const l = Number(k);
          const nodesInLayer = layers[l];
          const x = startX + l * LAYER_SPACING;

          // Distribute vertically
          const layerH = nodesInLayer.length * NODE_SPACING;
          const layerStartY = (graphHeight - layerH) / 2;

          nodesInLayer.forEach((n, i) => {
              n.x = x;
              n.y = layerStartY + i * NODE_SPACING;
          });
      });

      nodes = newNodes;
      edges = newEdges;
  }

  function toggleInput(node: VisualNode) {
      if (node.type === 'VAR' && node.label) {
          inputStates[node.label] = !inputStates[node.label];
          // Re-run build to update values
          // Ideally we optimize this but for < 50 nodes it's instant
          if (ast) buildGraph(ast);
      }
  }

  function handleKeydown(e: KeyboardEvent, node: VisualNode) {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleInput(node);
      }
  }

  $: if (ast && containerWidth > 0) {
      buildGraph(ast);
  }

  let exportContainer: HTMLElement;

  async function exportImage(type: 'png' | 'svg') {
      if (!exportContainer) return;
      try {
          let dataUrl = '';
          if (type === 'png') {
              dataUrl = await toPng(exportContainer, { backgroundColor: '#ffffff' });
          } else {
              dataUrl = await toSvg(exportContainer, { backgroundColor: '#ffffff' });
          }
          const link = document.createElement('a');
          link.download = `logic-circuit.${type}`;
          link.href = dataUrl;
          link.click();
      } catch (err) {
          console.error('Export failed', err);
      }
  }
</script>

<div
  class="w-full min-h-[400px] bg-slate-50 rounded-xl shadow-inner border border-gray-200 overflow-auto relative select-none touch-pan-x touch-pan-y"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <div class="absolute top-4 left-4 z-10 flex flex-col gap-1">
      <h3 class="font-semibold text-gray-800 flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
          {dict.circuit}
      </h3>
      <p class="text-xs text-slate-500 ml-1">Click inputs (blue) to toggle</p>
  </div>

  <div class="absolute top-4 right-4 z-10 flex gap-2">
      <button
        class="p-1.5 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 shadow-sm transition-colors text-gray-600 min-h-[44px] min-w-[44px]"
        title="Export PNG"
        on:click={() => exportImage('png')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      </button>
      <button
        class="p-1.5 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 shadow-sm transition-colors text-gray-600 min-h-[44px] min-w-[44px]"
        title="Export SVG"
        on:click={() => exportImage('svg')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      </button>
  </div>

  <div class="min-w-full min-h-full" style="width: {graphWidth}px; height: {graphHeight}px;" bind:this={exportContainer}>
  {#if ast}
    <svg width={graphWidth} height={graphHeight}>
        <defs>
            <marker id="arrowhead-on" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
            </marker>
            <marker id="arrowhead-off" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
        </defs>

        <!-- Edges -->
        {#each edges as edge (edge.from + edge.to + edge.active)}
            <path
                d="M {nodes.find(n => n.id === edge.from)?.x + 30} {nodes.find(n => n.id === edge.from)?.y + 20}
                   C {(nodes.find(n => n.id === edge.from)?.x + nodes.find(n => n.id === edge.to)?.x) / 2 + 30} {nodes.find(n => n.id === edge.from)?.y + 20},
                     {(nodes.find(n => n.id === edge.from)?.x + nodes.find(n => n.id === edge.to)?.x) / 2 - 30} {nodes.find(n => n.id === edge.to)?.y + 20},
                     {nodes.find(n => n.id === edge.to)?.x - 30} {nodes.find(n => n.id === edge.to)?.y + 20}"
                fill="none"
                stroke={edge.active ? '#4f46e5' : '#cbd5e1'}
                stroke-width={edge.active ? 3 : 2}
                marker-end={edge.active ? "url(#arrowhead-on)" : "url(#arrowhead-off)"}
                class="transition-colors duration-300"
            />
        {/each}

        <!-- Nodes -->
        {#each nodes as node (node.id)}
            <g
                transform="translate({node.x}, {node.y})"
                class="cursor-pointer transition-transform hover:scale-105 outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                on:click={() => toggleInput(node)}
                on:keydown={(e) => handleKeydown(e, node)}
                role="button"
                tabindex="0"
                aria-label="{node.label} {node.value ? 'On' : 'Off'}"
            >
                <!-- Shadow -->
                <rect width="60" height="40" rx="8" fill="rgba(0,0,0,0.05)" transform="translate(2, 2)" />

                <!-- Body -->
                <rect
                    width="60"
                    height="40"
                    rx="8"
                    fill={node.value ? '#ffffff' : '#f8fafc'}
                    stroke={node.value ? '#4f46e5' : '#94a3b8'}
                    stroke-width={node.value ? 2 : 1}
                    class="transition-colors duration-200"
                />

                <!-- Label -->
                <text
                    x="30"
                    y="20"
                    dy="5"
                    text-anchor="middle"
                    font-size="12"
                    font-weight="bold"
                    fill={node.value ? '#4f46e5' : '#64748b'}
                    font-family="monospace"
                >
                    {node.label || node.type}
                </text>

                <!-- Indicator for Input Types -->
                {#if node.type === 'VAR'}
                    <circle cx="5" cy="5" r="3" fill={node.value ? '#22c55e' : '#ef4444'} />
                {/if}
            </g>
        {/each}
    </svg>
  {:else}
    <div class="h-full flex flex-col items-center justify-center text-gray-400">
        <p>Circuit visualization will appear here</p>
    </div>
  {/if}
  </div>
</div>
