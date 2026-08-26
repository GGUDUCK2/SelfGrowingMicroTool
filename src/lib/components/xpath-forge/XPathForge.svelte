<script lang="ts">

    import { onMount } from 'svelte';
            import { Play, Copy, Download, Trash2, Code, History, Star, Maximize2, Search as SearchIcon, Link as LinkIcon, ChevronRight } from '@lucide/svelte';
    import { workspace, type ToolHistoryItem, smartSaveToHistory } from '$lib/db/workspace';



    export let lang: 'en' | 'ko' = 'en';
    export let dictionary: any = {};
    $: t = dictionary?.tools?.xpathForge || {};

    // State
    let sourceDocument = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Chef Master</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Magic Adventures</title>
    <author>Story Weaver</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web">
    <title lang="en">XQuery Kick Start</title>
    <author>Tech Lead</author>
    <year>2003</year>
    <price>49.99</price>
  </book>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>System Architect</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`;
    let xpathExpression = '//book[price>35.00]/title';
    let autoEvaluate = true;
    let results: Array<{ text: string, type: string, html: string }> = [];
    let matchedCount = 0;
    let evaluationError = '';
    let parseError = '';
    let history: ToolHistoryItem[] = [];
    let isHtml = false;
    let editorMode: 'raw' | 'tree' = 'raw';
    let resultsMode: 'nodes' | 'code' = 'nodes';

    // New features state
    let namespaces: Array<{ prefix: string, uri: string }> = [];
    let isNamespacesExpanded = false;

    // For Tree Viewer
    let parsedNodes: Array<TreeNode> = [];

    // Tree viewer structures
    interface TreeNode {
        node: Node;
        name: string;
        type: number;
        attributes: { name: string, value: string }[];
        children: TreeNode[];
        text: string;
        xpath: string;
        expanded: boolean;
    }

    $: faqItems = [
        { q: t?.q1 || '', a: t?.a1 || '' },
        { q: t?.q2 || '', a: t?.a2 || '' },
        { q: t?.q3 || '', a: t?.a3 || '' }
    ];

    let isMounted = false;

    onMount(async () => {
        isMounted = true;
        await loadHistory();
        if (autoEvaluate) {
            evaluateXPath();
        }
    });

    $: if (isMounted && autoEvaluate && sourceDocument !== undefined && xpathExpression !== undefined) {
        evaluateXPath();
    }

    function detectHtml(content: string) {
        const trimmed = content.trim().toLowerCase();
        return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html');
    }

    function escapeHtml(unsafe: string) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    async function evaluateXPath() {
        if (!isMounted) return;
        if (!sourceDocument || !xpathExpression) {
            results = [];
            matchedCount = 0;
            evaluationError = '';
            parseError = '';
            return;
        }

        evaluationError = '';
        parseError = '';
        results = [];
        matchedCount = 0;

        isHtml = detectHtml(sourceDocument);
        const parser = new DOMParser();
        const mimeType = isHtml ? 'text/html' : 'text/xml';

        try {
            const doc = parser.parseFromString(sourceDocument, mimeType);

            // Check for parsing errors in XML
            if (!isHtml) {
                const parseErrorNode = doc.querySelector('parsererror');
                if (parseErrorNode) {
                    parseError = t?.results?.parseError || 'Invalid XML';
                    return;
                }
            }

            try {
                // Custom namespace resolver
                const nsResolver = (prefix: string | null) => {
                    const ns = namespaces.find(n => n.prefix === prefix);
                    if (ns) return ns.uri;
                    // Fallback to default resolver
                    const defaultResolver = doc.createNSResolver(doc.documentElement);
                    return defaultResolver ? defaultResolver.lookupNamespaceURI(prefix) : null;
                };
                const result = doc.evaluate(
                    xpathExpression,
                    doc,
                    nsResolver,
                    XPathResult.ANY_TYPE,
                    null
                );

                const nodes = [];
                let node = result.iterateNext();
                while (node) {
                    nodes.push(node);
                    node = result.iterateNext();
                }

                matchedCount = nodes.length;
                results = nodes.map(n => {
                    let text = '';
                    let type = '';
                    let html = '';

                    if (n.nodeType === Node.ELEMENT_NODE) {
                        type = 'Element';
                        html = escapeHtml((n as Element).outerHTML);
                        text = n.textContent || '';
                    } else if (n.nodeType === Node.ATTRIBUTE_NODE) {
                        type = 'Attribute';
                        html = escapeHtml(`${(n as Attr).name}="${(n as Attr).value}"`);
                        text = n.textContent || '';
                    } else if (n.nodeType === Node.TEXT_NODE) {
                        type = 'Text';
                        html = escapeHtml(n.textContent || '');
                        text = n.textContent || '';
                    } else {
                        type = `Node Type ${n.nodeType}`;
                        html = escapeHtml(n.textContent || '');
                        text = n.textContent || '';
                    }

                    return { text, type, html };
                });

                // Only save to history if we have valid results
                if (matchedCount > 0) {
                     await saveToHistory(xpathExpression, matchedCount);
                }

                // Parse for Tree View if not already synced (or sync every time)
                generateTree(doc);

            } catch {
                evaluationError = t?.results?.error || 'Invalid XPath expression.';
            }

        } catch {
            parseError = t?.results?.parseError || 'Document parsing error.';
        }
    }

    async function loadHistory() {
        const items = await workspace.history
            .where('toolId')
            .equals('xpath-forge')
            .reverse()
            .limit(20)
            .sortBy('timestamp');
        history = items;
    }

    async function saveToHistory(expr: string, count: number) {
        if (!expr.trim()) return;

        // Check if latest is same
        const latest = await workspace.history
            .where('toolId')
            .equals('xpath-forge')
            .reverse()
            .limit(1)
            .sortBy('timestamp');

        if (latest.length > 0 && latest[0].input === expr) {
            return;
        }

        await workspace.history.add({
            toolId: 'xpath-forge',
            input: expr,
            result: { matchedCount: count },
            timestamp: Date.now(),
            starred: false
        });
        await loadHistory();
    }

    async function toggleStar(id: number) {
        const item = await workspace.history.get(id);
        if (item) {
            await workspace.history.update(id, { starred: !item.starred });
            await loadHistory();
        }
    }

    async function deleteHistoryItem(id: number) {
        if (id !== undefined) {
            await workspace.history.delete(id);
            await loadHistory();
        }
    }

    function loadHistoryItem(item: ToolHistoryItem) {
        if (typeof item.input === 'string') {
            xpathExpression = item.input;
            if (autoEvaluate) evaluateXPath();
        }
    }

    let showToastMessage = false;
    let toastType = 'success';
    let toastText = '';

    function showToast(msg: string, type: 'success' | 'error' = 'success') {
        toastText = msg;
        toastType = type;
        showToastMessage = true;
        setTimeout(() => showToastMessage = false, 2000);
    }

    async function handleCopy(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            showToast((dictionary)?.common?.actions || 'Copied', 'success');
        } catch {
            showToast('Failed to copy', 'error');
        }
    }

    function prettifyDocument() {
        if (!sourceDocument) return;
        try {
            let formatted = '';
            let reg = /(>)(<)(\/*)/g;
            let xml = sourceDocument.replace(reg, '$1\n$2$3');
            let pad = 0;
            xml.split('\n').forEach(function(node) {
                let indent = 0;
                if (node.match( /.+<\/\w[^>]*>$/ )) {
                    indent = 0;
                } else if (node.match( /^<\/\w/ )) {
                    if (pad !== 0) pad -= 1;
                } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
                    indent = 1;
                } else {
                    indent = 0;
                }
                let padding = '';
                for (let i = 0; i < pad; i++) {
                    padding += '  ';
                }
                formatted += padding + node + '\n';
                pad += indent;
            });
            sourceDocument = formatted.trim();
        } catch {
            showToast((t?.editor as any)?.formatError || 'Failed to format', 'error');
        }
    }

    function addNamespace() {
        namespaces = [...namespaces, { prefix: '', uri: '' }];
    }

    function removeNamespace(index: number) {
        namespaces = namespaces.filter((_, i) => i !== index);
        if (autoEvaluate) evaluateXPath();
    }

    function clearEditor() {
        sourceDocument = '';
        xpathExpression = '';
        results = [];
        matchedCount = 0;
        evaluationError = '';
        parseError = '';
        parsedNodes = [];
    }

    function generateTree(doc: Document) {
        parsedNodes = [];
        if (doc.documentElement) {
            parsedNodes = [buildTreeNode(doc.documentElement, '')];
        }
    }

    function buildTreeNode(node: Node, parentPath: string): TreeNode {
        let name = node.nodeName.toLowerCase();

        let path = parentPath;
        if (node.nodeType === Node.ELEMENT_NODE) {
            const siblings = Array.from(node.parentNode?.childNodes || []).filter(n => n.nodeName === node.nodeName);
            const index = siblings.indexOf(node as unknown as globalThis.ChildNode) + 1;
            path += `/${name}` + (siblings.length > 1 ? `[${index}]` : '');
        }

        const attributes = [];
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            for (let i = 0; i < el.attributes.length; i++) {
                attributes.push({ name: el.attributes[i].name, value: el.attributes[i].value });
            }
        }

        const children: TreeNode[] = [];
        let text = '';

        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === Node.ELEMENT_NODE) {
                children.push(buildTreeNode(child, path));
            } else if (child.nodeType === Node.TEXT_NODE) {
                const val = child.nodeValue?.trim();
                if (val) text += val + ' ';
            }
        }

        return {
            node,
            name,
            type: node.nodeType,
            attributes,
            children,
            text: text.trim(),
            xpath: path || '/',
            expanded: true
        };
    }

    function selectTreeNode(xpath: string) {
        xpathExpression = xpath;
        if (autoEvaluate) evaluateXPath();
    }

    function toggleNodeExpand(node: TreeNode) {
        node.expanded = !node.expanded;
        parsedNodes = [...parsedNodes];
    }

    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            sourceDocument = e.target?.result as string;
            if (autoEvaluate) evaluateXPath();
        };
        reader.readAsText(file);
    }

    function handleKeydown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            evaluateXPath();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showToastMessage}
    <div class="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white font-medium transition-all {toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}">
        {toastText}
    </div>
{/if}

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Column -->
        <div class="lg:col-span-2 space-y-6">
            <!-- XPath Input -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold flex items-center gap-2">
                        <LinkIcon class="w-5 h-5 text-indigo-500" />
                        {t?.xpath?.title}
                    </h2>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer min-h-[44px] min-w-[44px]">
                            <input type="checkbox" bind:checked={autoEvaluate} class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                            {t?.xpath?.autoEvaluate}
                        </label>
                        <button
                            on:click={evaluateXPath}
                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]"
                        >
                            <Play class="w-4 h-4" />
                            {t?.xpath?.evaluate}
                        </button>
                    </div>
                </div>
                <input
                    type="text"
                    bind:value={xpathExpression}
                    placeholder={t?.placeholder || "e.g. //book[price>35]"}
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                />
            </div>

            <!-- Namespaces section -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                    class="flex items-center justify-between w-full text-left font-medium text-sm text-gray-700 dark:text-gray-300 min-h-[44px] min-w-[44px]"
                    on:click={() => isNamespacesExpanded = !isNamespacesExpanded}
                >
                    <span class="flex items-center gap-2">
                        <Code class="w-4 h-4 text-indigo-500" />
                        {t?.namespaces?.title || 'Namespaces'}
                        {#if namespaces.length > 0}
                            <span class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                                {namespaces.length}
                            </span>
                        {/if}
                    </span>
                    <ChevronRight class="w-4 h-4 transition-transform {isNamespacesExpanded ? 'rotate-90' : ''}" />
                </button>

                {#if isNamespacesExpanded}
                    <div class="mt-4 space-y-3">
                        {#each namespaces as _, i (i)}
                            <div class="flex items-center gap-2">
                                <input
                                    type="text"
                                    bind:value={namespaces[i].prefix}
                                    on:input={() => autoEvaluate && evaluateXPath()}
                                    placeholder={t?.namespaces?.prefix || 'Prefix (e.g. svg)'}
                                    class="w-1/3 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span class="text-gray-500 font-bold">:</span>
                                <input
                                    type="text"
                                    bind:value={namespaces[i].uri}
                                    on:input={() => autoEvaluate && evaluateXPath()}
                                    placeholder={t?.namespaces?.uri || 'URI (e.g. http://www.w3.org/2000/svg)'}
                                    class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button
                                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    on:click={() => removeNamespace(i)}
                                    aria-label="Remove Namespace"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        {/each}
                        <button
                            class="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 min-h-[44px] min-w-[44px]"
                            on:click={addNamespace}
                        >
                            <span class="text-lg leading-none">+</span> {t?.namespaces?.add || 'Add Namespace'}
                        </button>
                    </div>
                {/if}
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[500px]">
                <!-- Document Editor -->
                <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <div class="flex items-center gap-4">
                            <h3 class="font-semibold text-sm flex items-center gap-2">
                                <Code class="w-4 h-4 text-blue-500" />
                                {t?.editor?.title}
                            </h3>
                            <div class="flex bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg">
                                <button
                                    class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] {editorMode === 'raw' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} min-h-[44px] min-w-[44px]"
                                    on:click={() => editorMode = 'raw'}
                                >
                                    {t?.editor?.raw || 'Raw'}
                                </button>
                                <button
                                    class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] {editorMode === 'tree' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} min-h-[44px] min-w-[44px]"
                                    on:click={() => editorMode = 'tree'}
                                >
                                    {t?.editor?.tree || 'Tree Viewer'}
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide whitespace-nowrap shrink-0">
                            <button class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center " aria-label={(t?.editor as any)?.prettify || 'Prettify'} on:click={prettifyDocument}>
                                <Code class="w-4 h-4" />
                            </button>
                            <label class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t?.editor?.upload}>
                                <input type="file" class="hidden" accept=".xml,.html,.txt" on:change={handleFileUpload} />
                                <Download class="w-4 h-4" />
                            </label>
                            <button class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center " aria-label={t?.editor?.clear} on:click={clearEditor}>
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {#if editorMode === 'raw'}
                        <textarea
                            bind:value={sourceDocument}
                            placeholder={t?.editor?.placeholder}
                            class="flex-1 w-full p-4 bg-transparent border-none resize-none focus:ring-0 font-mono text-xs text-gray-800 dark:text-gray-200"
                            spellcheck="false"
                        ></textarea>
                    {:else}
                        <div class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 font-mono text-xs scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                            {#if parsedNodes.length === 0}
                                <div class="h-full flex items-center justify-center text-gray-400">
                                    {t?.editor?.treeEmpty || 'No valid XML/HTML parsed yet.'}
                                </div>
                            {:else}
                                <!-- Recursive Tree Rendering -->
                                {#each parsedNodes as node (node.xpath)}
                                    <svelte:self {node} />
                                    <!-- Embedded component logic for tree nodes -->
                                    <div class="ml-4 space-y-1">
                                        {#each [node] as n (n.xpath)}
                                            <div class="flex flex-col">
                                                <div class="flex items-center gap-2 py-1 group">
                                                    {#if n.children.length > 0}
                                                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                        <div
                                                            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-4 h-4 flex items-center justify-center -ml-2 p-2"
                                                            on:click={() => toggleNodeExpand(n)}
                                                        >
                                                            <ChevronRight class="w-3 h-3 transition-transform {n.expanded ? 'rotate-90' : ''}" />
                                                        </div>
                                                    {:else}
                                                        <div class="w-4 h-4"></div>
                                                    {/if}

                                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                    <div
                                                        class="cursor-pointer flex flex-wrap gap-2 items-center hover:bg-gray-200 dark:hover:bg-gray-800 px-2 py-1 -my-1 rounded relative z-10"
                                                        on:click={() => selectTreeNode(n.xpath)}
                                                    >
                                                        <span class="text-blue-600 dark:text-blue-400 font-semibold">&lt;{n.name}&gt;</span>
                                                        {#each n.attributes as attr (attr.name)}
                                                            <span class="text-orange-600 dark:text-orange-400">
                                                                {attr.name}="<span class="text-green-600 dark:text-green-400">{attr.value}</span>"
                                                            </span>
                                                        {/each}
                                                        {#if n.text && n.children.length === 0}
                                                            <span class="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{n.text}</span>
                                                        {/if}
                                                    </div>

                                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                    <div
                                                        class="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 cursor-pointer ml-auto hover:text-indigo-500 py-1"
                                                        on:click={() => selectTreeNode(n.xpath)}
                                                    >
                                                        {n.xpath}
                                                    </div>
                                                </div>

                                                {#if n.expanded && n.children.length > 0}
                                                    <div class="ml-6 border-l border-gray-200 dark:border-gray-700 pl-2">
                                                        {#each n.children as child (child.xpath)}
                                                            <div class="flex flex-col">
                                                                <div class="flex items-center gap-2 py-1 group">
                                                                    {#if child.children.length > 0}
                                                                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                                        <div
                                                                            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-4 h-4 flex items-center justify-center -ml-2 p-2"
                                                                            on:click={() => toggleNodeExpand(child)}
                                                                        >
                                                                            <ChevronRight class="w-3 h-3 transition-transform {child.expanded ? 'rotate-90' : ''}" />
                                                                        </div>
                                                                    {:else}
                                                                        <div class="w-4 h-4"></div>
                                                                    {/if}

                                                                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                                    <div
                                                                        class="cursor-pointer flex flex-wrap gap-2 items-center hover:bg-gray-200 dark:hover:bg-gray-800 px-2 py-1 -my-1 rounded relative z-10"
                                                                        on:click={() => selectTreeNode(child.xpath)}
                                                                    >
                                                                        <span class="text-blue-600 dark:text-blue-400 font-semibold">&lt;{child.name}&gt;</span>
                                                                        {#each child.attributes as attr (attr.name)}
                                                                            <span class="text-orange-600 dark:text-orange-400">
                                                                                {attr.name}="<span class="text-green-600 dark:text-green-400">{attr.value}</span>"
                                                                            </span>
                                                                        {/each}
                                                                        {#if child.text && child.children.length === 0}
                                                                            <span class="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{child.text}</span>
                                                                        {/if}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        {/each}
                                                        <!-- Simplified rendering for children depths beyond 2, user can click into raw or we can use a component. -->
                                                        <!-- Note: To do infinite recursion elegantly in Svelte without a separate file, we could just allow max 2 levels, or keep expanding. Given file constraints, we only show 2 levels deep natively here. -->
                                                    </div>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    {/if}
                </div>

                <!-- Results Panel -->
                <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <div class="flex items-center gap-4">
                            <h3 class="font-semibold text-sm flex items-center gap-2">
                                <Maximize2 class="w-4 h-4 text-green-500" />
                                {t?.results?.title}
                            </h3>
                            <div class="flex bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg">
                                <button
                                    class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] {resultsMode === 'nodes' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} min-h-[44px] min-w-[44px]"
                                    on:click={() => resultsMode = 'nodes'}
                                >
                                    {t?.results?.nodes || 'Nodes'}
                                </button>
                                <button
                                    class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] {resultsMode === 'code' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} min-h-[44px] min-w-[44px]"
                                    on:click={() => resultsMode = 'code'}
                                >
                                    {t?.results?.code || 'Code'}
                                </button>
                            </div>
                        </div>
                        {#if matchedCount > 0 && resultsMode === 'nodes'}
                            <span class="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                {matchedCount} {t?.results?.matchedCount}
                            </span>
                        {/if}
                    </div>

                    <div class="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        {#if parseError}
                            <div class="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400" role="alert">
                                <span class="font-medium">Error:</span> {parseError}
                            </div>
                        {:else if evaluationError}
                            <div class="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400" role="alert">
                                <span class="font-medium">Error:</span> {evaluationError}
                            </div>
                        {:else if results.length === 0}
                            <div class="h-full flex flex-col items-center justify-center text-gray-400">
                                <SearchIcon class="w-12 h-12 mb-4 opacity-20" />
                                <p class="text-sm">{t?.results?.empty}</p>
                            </div>
                        {:else if resultsMode === 'nodes'}
                            <div class="space-y-4">
                                {#each results as result, i (i)}
                                    <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="text-xs font-semibold text-indigo-500 uppercase tracking-wider">{result.type}</span>
                                            <button
                                                class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-1 right-1"
                                                on:click={() => handleCopy(result.text)}
                                                aria-label="Copy"
                                            >
                                                <Copy class="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                        <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">{@html result.html}</pre>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="space-y-4">
                                <!-- JavaScript Snippet -->
                                <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-xs font-semibold text-yellow-500 uppercase tracking-wider">JavaScript (DOM)</span>
                                        <button
                                            class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-1 right-1"
                                            on:click={() => handleCopy(`const result = document.evaluate('${xpathExpression.replace(/'/g, "\\'")}', document, null, XPathResult.ANY_TYPE, null);\nlet node, nodes = [];\nwhile (node = result.iterateNext()) nodes.push(node);`)}
                                            aria-label="Copy JavaScript"
                                        >
                                            <Copy class="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">const result = document.evaluate(
  '{xpathExpression}',
  document,
  null,
  XPathResult.ANY_TYPE,
  null
);
let node, nodes = [];
while (node = result.iterateNext()) nodes.push(node);</pre>
                                </div>

                                <!-- Playwright Snippet -->
                                <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-xs font-semibold text-green-500 uppercase tracking-wider">Playwright</span>
                                        <button
                                            class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-1 right-1"
                                            on:click={() => handleCopy(`await page.locator('xpath=${xpathExpression.replace(/'/g, "\\'")}').all();`)}
                                            aria-label="Copy Playwright"
                                        >
                                            <Copy class="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">const elements = await page.locator('xpath={xpathExpression}').all();</pre>
                                </div>

                                <!-- Python Lxml Snippet -->
                                <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-xs font-semibold text-blue-500 uppercase tracking-wider">Python (lxml)</span>
                                        <button
                                            class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-1 right-1"
                                            on:click={() => handleCopy(`from lxml import etree\ntree = etree.parse('document.xml')\nnodes = tree.xpath('${xpathExpression.replace(/'/g, "\\'")}')`)}
                                            aria-label="Copy Python"
                                        >
                                            <Copy class="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">from lxml import etree

tree = etree.parse('document.xml')
nodes = tree.xpath('{xpathExpression}')</pre>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar (History & Cheatsheet) -->
        <div class="space-y-6">
            <!-- History -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-[300px] flex flex-col">
                <h3 class="font-semibold text-sm flex items-center gap-2 mb-4">
                    <History class="w-4 h-4 text-gray-500" />
                    {t?.history?.title}
                </h3>
                <div class="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {#if history.length === 0}
                        <p class="text-sm text-gray-500 text-center mt-8">{t?.history?.empty}</p>
                    {:else}
                        {#each history as item (item.id)}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div class="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer min-h-[44px] min-w-[44px]" on:click={() => loadHistoryItem(item)}>
                                <div class="flex-1 min-w-0 pr-2">
                                    <p class="text-sm font-mono truncate text-gray-700 dark:text-gray-300">{item.input}</p>
                                    <p class="text-xs text-gray-400 mt-1">{(item.result as {matchedCount?: number})?.matchedCount || 0} {t?.results?.matchedCount}</p>
                                </div>
                                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-400 hover:text-yellow-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                        on:click|stopPropagation={() => item.id !== undefined && toggleStar(item.id)}
                                        aria-label="Star"
                                    >
                                        <Star class="w-4 h-4 {item.starred ? 'text-yellow-500 fill-current' : ''}" />
                                    </button>
                                    <button
                                        class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                        on:click|stopPropagation={() => item.id !== undefined && deleteHistoryItem(item.id)}
                                        aria-label="Delete"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Cheatsheet -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex-1 flex flex-col h-[400px]">
                <h3 class="font-semibold text-sm flex items-center gap-2 mb-4">
                    <Code class="w-4 h-4 text-purple-500" />
                    {t?.cheatsheet?.title}
                </h3>
                <div class="flex-1 overflow-y-auto text-sm space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    <div>
                        <h4 class="font-medium text-gray-500 mb-2">{t?.cheatsheet?.basic}</h4>
                        <ul class="space-y-2 font-mono text-xs">
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '//book'}><span>//node</span><span class="text-gray-400 ml-2 text-right">All node elements</span></li>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '//@category'}><span>//@attr</span><span class="text-gray-400 ml-2 text-right">All attr attributes</span></li>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '/bookstore/book[1]'}><span>/node/child[1]</span><span class="text-gray-400 ml-2 text-right">First child</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-500 mb-2">{t?.cheatsheet?.predicates}</h4>
                        <ul class="space-y-2 font-mono text-xs">
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '//book[@category="web"]'}><span>//node[@attr="val"]</span></li>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '//book[price>35.00]'}><span>//node[child>val]</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-500 mb-2">{t?.cheatsheet?.functions}</h4>
                        <ul class="space-y-2 font-mono text-xs">
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '//*[contains(text(), "XML")]'}><span>contains(text(), "val")</span></li>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = '//*[starts-with(@category, "c")]'}><span>starts-with(@attr, "val")</span></li>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li class="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded min-h-[44px] min-w-[44px]" on:click={() => xpathExpression = 'count(//book)'}><span>count(//node)</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>



</div>
