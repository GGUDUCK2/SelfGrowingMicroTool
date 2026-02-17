<script lang="ts">
  import type { LogicAST } from '$lib/types/logic-forge';
  import { getDictionary } from '$lib/dictionaries';

  export let lang: string = 'en';
  export let ast: LogicAST | null = null;

  $: dict = getDictionary(lang).tools.logicForge;

  let containerWidth = 0;
  let containerHeight = 0;

  $: layoutWidth = Math.max(containerWidth, 600);

  // Simple layout logic
  interface Node {
    id: string;
    type: string;
    label?: string;
    x: number;
    y: number;
    depth: number;
    children: Node[];
  }

  interface Edge {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  let nodes: Node[] = [];
  let edges: Edge[] = [];

  function processAST(node: LogicAST, depth: number, idPrefix: string): Node {
    const id = idPrefix;
    let n: Node = {
      id,
      type: node.type,
      x: 0,
      y: 0,
      depth,
      children: []
    };

    if (node.type === 'VAR' || node.type === 'CONST') {
      n.label = node.type === 'VAR' ? node.name : (node.value ? '1' : '0');
    } else if (node.type === 'NOT') {
        n.children.push(processAST(node.operand, depth + 1, id + 'L'));
    } else if ('left' in node) {
        n.children.push(processAST(node.left, depth + 1, id + 'L'));
        n.children.push(processAST(node.right, depth + 1, id + 'R'));
    }
    return n;
  }

  function layout(root: Node | null) {
      if (!root || containerWidth === 0) return;

      // Calculate max depth
      let maxDepth = 0;
      const nodesByDepth: Record<number, Node[]> = {};

      function traverse(n: Node, d: number) {
          maxDepth = Math.max(maxDepth, d);
          if (!nodesByDepth[d]) nodesByDepth[d] = [];
          nodesByDepth[d].push(n);
          n.children.forEach(c => traverse(c, d + 1));
      }
      traverse(root, 0);

      // Assign positions
      // Root is at depth 0, we want it on the right.
      // Leaves are at maxDepth, we want them on the left.
      // Actually AST depth is inverted relative to visual flow (Input -> Output).
      // AST Root is Output.

      const layerWidth = layoutWidth / (maxDepth + 2);

      Object.keys(nodesByDepth).forEach(dKey => {
          const d = Number(dKey);
          const layerNodes = nodesByDepth[d];
          // x position: Output (depth 0) is at Width - padding
          // Inputs (depth max) are at padding
          const x = layoutWidth - 50 - (d * layerWidth);

          // y position: Distribute evenly
          const layerHeight = containerHeight / (layerNodes.length + 1);
          layerNodes.forEach((node, i) => {
             node.x = x;
             node.y = (i + 1) * layerHeight;
          });
      });

      // Flatten nodes and build edges
      const nodeList: Node[] = [];
      const edgeList: Edge[] = [];

      function buildLists(n: Node) {
          nodeList.push(n);
          n.children.forEach(c => {
              edgeList.push({
                  x1: c.x + 40, // Output of child
                  y1: c.y,
                  x2: n.x - 40, // Input of parent
                  y2: n.y
              });
              buildLists(c);
          });
      }
      buildLists(root);

      nodes = nodeList;
      edges = edgeList;
  }

  $: if (ast && layoutWidth > 0 && containerHeight > 0) {
      const root = processAST(ast, 0, 'root');
      layout(root);
  }
</script>

<div
  class="w-full min-h-[300px] md:h-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <div class="absolute top-4 left-4 z-10 flex gap-2">
      <h3 class="font-semibold text-gray-800 flex items-center gap-2 bg-white/80 px-2 py-1 rounded backdrop-blur">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
          {dict.circuit}
      </h3>
  </div>

  {#if ast}
    <svg width={layoutWidth} height="100%">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
        </defs>

        {#each edges as edge}
            <path
                d="M {edge.x1} {edge.y1} C {(edge.x1 + edge.x2)/2} {edge.y1}, {(edge.x1 + edge.x2)/2} {edge.y2}, {edge.x2} {edge.y2}"
                fill="none"
                stroke="#cbd5e1"
                stroke-width="2"
                marker-end="url(#arrowhead)"
            />
        {/each}

        {#each nodes as node}
            <g transform="translate({node.x - 30}, {node.y - 20})">
                <!-- Box -->
                <rect width="60" height="40" rx="6" fill={node.type === 'VAR' || node.type === 'CONST' ? '#eff6ff' : '#f8fafc'} stroke={node.type === 'VAR' || node.type === 'CONST' ? '#3b82f6' : '#64748b'} stroke-width="2" />
                <!-- Label -->
                <text x="30" y="25" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b" font-family="monospace">
                    {node.label || node.type}
                </text>
            </g>
        {/each}
    </svg>
  {:else}
    <div class="h-full flex flex-col items-center justify-center text-gray-400">
        <p>Circuit visualization will appear here</p>
    </div>
  {/if}
</div>
