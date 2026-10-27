/* global localStorage, fetch */

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
const memoryStore = {}
const FILE_PROTOCOL = typeof location !== 'undefined' && location.protocol === 'file:'

const ICONS = {
  loom: '<path d="M3 7h5v10H3z"/><path d="M10 7h4v10h-4z"/><path d="M16 7h2a2 2 0 0 1 2 2v2"/><path d="M18 11h2v6h-2z"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  workflow: '<circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  compare: '<circle cx="6" cy="6" r="2.5"/><path d="M8.5 6H20"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 18H20"/><path d="M16 3.5V20"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  split: '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M3 16h5v5"/><path d="M16 21h5v-5"/><line x1="21" y1="3" x2="12" y2="12"/><line x1="3" y1="3" x2="12" y2="12"/><line x1="3" y1="21" x2="12" y2="12"/><line x1="21" y1="21" x2="12" y2="12"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  sparkles: '<path d="m12 3 1.9 5.8L20 10.7l-6.1 1.9L12 18.4l-1.9-5.8L4 10.7l6.1-1.9z"/><path d="m19 16 .7 2.1L22 19l-2.3.9L19 22l-.7-2.1L16 19l2.3-.9z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  api: '<path d="m4 17 6-6-2-2"/><path d="M14 7l6 6"/><path d="M3 21l2-2"/><path d="M7 7l2-2 1 1"/><path d="M14 14l2 2 1-1"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4"/><circle cx="12" cy="3" r="1"/><line x1="9" y1="13" x2="9" y2="15"/><line x1="15" y1="13" x2="15" y2="15"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  edit: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  run: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
}

function icon(name, size = 16) {
  const inner = ICONS[name] || ICONS.circle
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
}

const NODE_TYPES = {
  start: { label: '开始', icon: 'zap', color: '#16a34a', desc: '定义输入变量并启动流程' },
  llm: { label: 'LLM', icon: 'sparkles', color: '#7c3aed', desc: '调用模型生成文本' },
  retrieval: { label: '知识检索', icon: 'database', color: '#2563eb', desc: '从知识库召回相关片段' },
  agent: { label: 'Agent', icon: 'bot', color: '#0891b2', desc: '自主规划并调用工具完成任务' },
  condition: { label: '条件判断', icon: 'split', color: '#d97706', desc: '按条件分流到不同分支' },
  code: { label: '代码转换', icon: 'code', color: '#475569', desc: '对上游结果做简单转换' },
  end: { label: '结束', icon: 'flag', color: '#dc2626', desc: '输出最终结果' },
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  }
  catch {
    // Fall through to the in-memory store.
  }
  return key in memoryStore ? memoryStore[key] : fallback
}

function save(key, value) {
  memoryStore[key] = value
  try {
    localStorage.setItem(key, JSON.stringify(value))
  }
  catch {
    // In-memory fallback keeps the app usable when storage is unavailable.
  }
}

function toast(message, kind = 'ok') {
  const root = $('#toast-root')
  const el = document.createElement('div')
  el.className = `toast ${kind}`
  el.textContent = message
  root.appendChild(el)
  setTimeout(() => el.remove(), 2600)
}

function openModal({ title, body, actions, wide = false }) {
  const root = $('#modal-root')
  root.innerHTML = `
    <div class="modal-backdrop" data-close>
      <div class="modal" style="${wide ? 'width:min(760px,100%)' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head"><span>${escapeHtml(title)}</span><button class="icon-btn sm" data-close title="关闭">${icon('x')}</button></div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">${actions || '<button class="btn" data-close>关闭</button>'}</div>
      </div>
    </div>`
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]')) closeModal()
  })
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal()
  })
}

function closeModal() {
  $('#modal-root').innerHTML = ''
}

function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function formatTime(ts) {
  const date = new Date(ts)
  return date.toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const DEMO_WORKFLOW = {
  id: 'wf-demo',
  appId: 'app-demo',
  name: '智能客服助手',
  nodes: [
    { id: 'n1', type: 'start', x: 60, y: 260, data: { title: '开始', inputKeys: ['query'] } },
    { id: 'n2', type: 'llm', x: 330, y: 250, data: { title: '意图理解', model: 'gpt-4o-mini', prompt: '你是客服助手，请判断用户意图。\n\n用户输入：{{query}}\n\n请给出结构化意图。', temperature: 0.3 } },
    { id: 'n3', type: 'retrieval', x: 600, y: 250, data: { title: '知识检索', query: '{{query}}', topK: 3 } },
    { id: 'n4', type: 'llm', x: 870, y: 250, data: { title: '生成回答', model: 'gpt-4o-mini', prompt: '根据知识片段回答用户问题。\n\n用户问题：{{query}}\n\n请给出友好、可执行的回复。', temperature: 0.7 } },
    { id: 'n5', type: 'end', x: 1140, y: 250, data: { title: '结束', summary: '{{生成回答}}' } },
  ],
  edges: [
    { id: 'e1', from: 'n1', to: 'n2' },
    { id: 'e2', from: 'n2', to: 'n3' },
    { id: 'e3', from: 'n3', to: 'n4' },
    { id: 'e4', from: 'n4', to: 'n5' },
  ],
}

function seedData() {
  if (load('loom.seeded', null)) return
  const apps = [
    { id: 'app-demo', name: '智能客服助手', type: 'Agent', color: '#7c3aed', icon: 'bot', desc: '自动判断意图、检索知识并生成客服回复', runs: 12, updatedAt: Date.now() - 1000 * 60 * 18 },
    { id: 'app-2', name: '产品手册问答', type: 'RAG', color: '#2563eb', icon: 'database', desc: '基于产品与退款政策文档的检索式问答', runs: 7, updatedAt: Date.now() - 1000 * 60 * 60 * 3 },
    { id: 'app-3', name: '营销文案生成', type: 'Workflow', color: '#0e7d72', icon: 'sparkles', desc: '输入卖点，生成多版本社媒文案', runs: 5, updatedAt: Date.now() - 1000 * 60 * 60 * 26 },
  ]
  const docs = [
    {
      id: 'doc-1',
      title: '退款政策',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      content: '退款政策\n\n用户可在签收后 7 天内申请无理由退款。商品需保持完好且不影响二次销售。退款申请通过后，款项将在 3 到 5 个工作日内原路退回。\n\n如商品存在质量问题，用户可申请换货或全额退款，运费由平台承担。定制类商品、已激活的虚拟商品不支持无理由退款。\n\n超过 7 天但未超过 30 天的订单，可申请换货处理。超过 30 天的订单暂不支持售后。',
      chunkSize: 160,
    },
    {
      id: 'doc-2',
      title: '产品介绍',
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
      content: '产品介绍\n\nLoom Studio 是一个轻量 LLM 应用开发平台，提供可视化工作流、Prompt 实验室、RAG 知识库和可观测性。\n\n平台支持 OpenAI 兼容模型接口。未配置模型时，会使用确定性的本地模拟引擎生成回复，方便离线演示和教学。\n\n每一次运行都会记录节点级输入、输出、耗时、Token 和成本，并支持时间旅行回放，帮助定位工作流中的错误步骤。',
      chunkSize: 180,
    },
  ]
  const runs = [
    {
      id: 'run-1',
      appId: 'app-demo',
      appName: '智能客服助手',
      status: 'success',
      startedAt: Date.now() - 1000 * 60 * 8,
      inputs: { query: '我收到商品三天了，可以退款吗？' },
      output: '可以。签收后 7 天内可以申请无理由退款，商品需保持完好。',
      totalTokens: 312,
      totalCost: 0.0006,
      totalDuration: 860,
      steps: [
        { id: 'step-1', nodeId: 'n1', name: '开始', type: 'start', output: { query: '我收到商品三天了，可以退款吗？' }, meta: { durationMs: 2, tokens: 0, cost: 0 } },
        { id: 'step-2', nodeId: 'n2', name: '意图理解', type: 'llm', output: '意图：退款咨询', meta: { durationMs: 284, tokens: 96, cost: 0.0002 } },
        { id: 'step-3', nodeId: 'n3', name: '知识检索', type: 'retrieval', output: { answer: '检索到 2 个相关片段，来自《退款政策》等文档。' }, meta: { durationMs: 96, tokens: 88, cost: 0 } },
        { id: 'step-4', nodeId: 'n4', name: '生成回答', type: 'llm', output: '可以。签收后 7 天内可以申请无理由退款，商品需保持完好。', meta: { durationMs: 462, tokens: 128, cost: 0.0004 } },
        { id: 'step-5', nodeId: 'n5', name: '结束', type: 'end', output: '可以。签收后 7 天内可以申请无理由退款，商品需保持完好。', meta: { durationMs: 3, tokens: 0, cost: 0 } },
      ],
    },
    {
      id: 'run-2',
      appId: 'app-2',
      appName: '产品手册问答',
      status: 'success',
      startedAt: Date.now() - 1000 * 60 * 45,
      inputs: { query: 'Loom Studio 支持哪些模型？' },
      output: '支持 OpenAI 兼容模型接口，也可使用本地模拟引擎。',
      totalTokens: 248,
      totalCost: 0.0005,
      totalDuration: 690,
      steps: [
        { id: 'step-1', nodeId: 'r1', name: '开始', type: 'start', output: { query: 'Loom Studio 支持哪些模型？' }, meta: { durationMs: 2, tokens: 0, cost: 0 } },
        { id: 'step-2', nodeId: 'r2', name: '知识检索', type: 'retrieval', output: { answer: '检索到 2 个相关片段。' }, meta: { durationMs: 118, tokens: 92, cost: 0 } },
        { id: 'step-3', nodeId: 'r3', name: '生成回答', type: 'llm', output: '支持 OpenAI 兼容模型接口，也可使用本地模拟引擎。', meta: { durationMs: 570, tokens: 156, cost: 0.0005 } },
      ],
    },
  ]
  save('loom.apps', apps)
  save('loom.workflows', { [DEMO_WORKFLOW.id]: DEMO_WORKFLOW })
  save('loom.docs', docs)
  save('loom.runs', runs)
  save('loom.settings', { demo: true, baseUrl: '', apiKey: '', model: 'gpt-4o-mini', temperature: 0.7 })
  save('loom.seeded', '1')
}

function ensureAdvancedSeed() {
  if (load('loom.advancedSeed', null)) return
  const apps = load('loom.apps', [])
  const workflows = load('loom.workflows', {})
  const runs = load('loom.runs', [])
  if (!apps.some((app) => app.id === 'app-agent')) {
    apps.push({
      id: 'app-agent',
      name: '竞品调研 Agent',
      type: 'Agent',
      color: '#0891b2',
      icon: 'bot',
      desc: '自主规划工具调用，检索知识库并联网总结',
      runs: 1,
      updatedAt: Date.now() - 1000 * 60 * 12,
    })
  }
  workflows['wf-agent'] = {
    id: 'wf-agent',
    appId: 'app-agent',
    name: '竞品调研 Agent',
    nodes: [
      { id: 'a1', type: 'start', x: 70, y: 240, data: { title: '开始', inputKeys: ['query'] } },
      { id: 'a2', type: 'agent', x: 360, y: 230, data: { title: '调研 Agent', task: '请研究并总结：{{query}}', system: '你是一个市场调研智能体。', tools: ['web_search', 'knowledge_search'], maxSteps: 4 } },
      { id: 'a3', type: 'end', x: 680, y: 230, data: { title: '结束', summary: '{{调研 Agent}}' } },
    ],
    edges: [
      { id: 'ae1', from: 'a1', to: 'a2' },
      { id: 'ae2', from: 'a2', to: 'a3' },
    ],
  }
  if (!runs.some((run) => run.id === 'run-agent')) {
    runs.unshift({
      id: 'run-agent',
      appId: 'app-agent',
      appName: '竞品调研 Agent',
      status: 'success',
      startedAt: Date.now() - 1000 * 60 * 12,
      inputs: { query: 'Loom Studio 的主要能力' },
      output: '综合工具信息后：知识库与联网搜索均返回了相关结果。',
      totalTokens: 186,
      totalCost: 0.0007,
      totalDuration: 1180,
      steps: [
        { id: 'as1', nodeId: 'a1', name: '开始', type: 'start', output: { query: 'Loom Studio 的主要能力' }, meta: { durationMs: 2, tokens: 0, cost: 0 } },
        { id: 'as2', nodeId: 'a2', name: '调研 Agent', type: 'agent', output: { answer: '综合工具信息后：知识库与联网搜索均返回了相关结果。', trace: [{ step: 1, thought: '先分析任务，并尝试调用可用工具。', action: 'web_search', tool: '联网搜索', observation: '找到 2 条与问题相关的模拟网页结果。' }, { step: 2, thought: '工具结果已经拿到，现在把信息整理成可执行的答案。', action: 'finish', tool: '完成', observation: '综合工具信息后：知识库与联网搜索均返回了相关结果。' }] }, meta: { durationMs: 920, tokens: 146, cost: 0.0006 } },
        { id: 'as3', nodeId: 'a3', name: '结束', type: 'end', output: '综合工具信息后：知识库与联网搜索均返回了相关结果。', meta: { durationMs: 3, tokens: 0, cost: 0 } },
      ],
    })
  }
  save('loom.apps', apps)
  save('loom.workflows', workflows)
  save('loom.runs', runs)
  save('loom.advancedSeed', '1')
}

const state = {
  view: 'dashboard',
  apps: [],
  workflows: {},
  docs: [],
  runs: [],
  settings: {},
  selectedAppId: null,
  activeFlowId: null,
  activeRunId: null,
  replay: { index: 0, playing: false, timer: null },
}

function loadState() {
  seedData()
  ensureAdvancedSeed()
  state.apps = load('loom.apps', [])
  state.workflows = load('loom.workflows', {})
  state.docs = load('loom.docs', [])
  state.runs = load('loom.runs', [])
  state.settings = load('loom.settings', { demo: true, baseUrl: '', apiKey: '', model: 'gpt-4o-mini', temperature: 0.7 })
}

function persistState() {
  save('loom.apps', state.apps)
  save('loom.workflows', state.workflows)
  save('loom.docs', state.docs)
  save('loom.runs', state.runs)
  save('loom.settings', state.settings)
}

function appById(id) {
  return state.apps.find((app) => app.id === id)
}

function flowForApp(appId) {
  const flow = Object.values(state.workflows).find((item) => item.appId === appId)
  return flow || null
}

function updateTopbar({ title, crumb = '', hint = '', actions = '' }) {
  $('#page-title').textContent = title
  $('#page-crumb').textContent = crumb
  $('#page-hint').textContent = hint
  $('#top-actions').innerHTML = actions
}

function render() {
  const view = state.view
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view))
  const viewEl = $('#view')
  viewEl.className = ''
  if (view === 'workflow') viewEl.classList.add('studio-view')
  if (view === 'dashboard') renderDashboard(viewEl)
  if (view === 'workflow') renderWorkflow(viewEl)
  if (view === 'lab') renderLab(viewEl)
  if (view === 'knowledge') renderKnowledge(viewEl)
  if (view === 'observability') renderObservability(viewEl)
  if (view === 'settings') renderSettings(viewEl)
}

function go(view) {
  state.view = view
  if (state.replay.timer) {
    clearInterval(state.replay.timer)
    state.replay.timer = null
  }
  render()
}

function setupNavigation() {
  $('#side-nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]')
    if (button) {
      if (button.dataset.view === 'observability') state.activeRunId = null
      go(button.dataset.view)
    }
  })
}

function hydrateStaticIcons() {
  $$('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon)
  })
}

/* ---------------- Dashboard ---------------- */

function renderDashboard(root) {
  const runs = [...state.runs].sort((a, b) => b.startedAt - a.startedAt)
  const success = state.runs.filter((run) => run.status === 'success').length
  const avgLatency = state.runs.length ? Math.round(state.runs.reduce((sum, run) => sum + (run.totalDuration || 0), 0) / state.runs.length) : 0
  const totalTokens = state.runs.reduce((sum, run) => sum + (run.totalTokens || 0), 0)
  updateTopbar({
    title: '概览',
    crumb: '工作空间 / 概览',
    hint: `${formatNumber(state.runs.length)} 次运行已记录`,
    actions: `<button class="btn primary" data-action="new-app">${icon('plus')}新建应用</button>`,
  })
  root.innerHTML = `
    <div class="stats-row">
      <div class="stat"><div class="stat-label">${icon('layers')}应用总数</div><div class="stat-value">${state.apps.length}</div><div class="stat-sub">含 Agent、RAG 与工作流</div></div>
      <div class="stat"><div class="stat-label">${icon('activity')}运行次数</div><div class="stat-value">${formatNumber(state.runs.length)}</div><div class="stat-sub">成功率 ${state.runs.length ? Math.round(success / state.runs.length * 100) : 100}%</div></div>
      <div class="stat"><div class="stat-label">${icon('clock')}平均耗时</div><div class="stat-value">${avgLatency}<small style="font-size:13px">ms</small></div><div class="stat-sub">端到端节点耗时</div></div>
      <div class="stat"><div class="stat-label">${icon('sparkles')}Token 消耗</div><div class="stat-value">${formatNumber(totalTokens)}</div><div class="stat-sub">预估成本 $${state.runs.reduce((sum, run) => sum + (run.totalCost || 0), 0).toFixed(4)}</div></div>
    </div>
    <div class="dash-grid">
      <section>
        <div class="section-title">${icon('layers')}应用</div>
        <div class="apps-grid">
          ${state.apps.map(appCard).join('')}
          <button class="app-card" style="border:1px dashed var(--line-strong); background:transparent; display:flex; align-items:center; justify-content:center; gap:8px; color:var(--muted); min-height:148px" data-action="new-app">${icon('plus')}新建应用</button>
        </div>
      </section>
      <section>
        <div class="section-title">${icon('activity')}最近运行</div>
        <div class="card">
          ${runs.length ? `<table class="table">
            <thead><tr><th>应用</th><th>状态</th><th>耗时</th><th>时间</th></tr></thead>
            <tbody>${runs.slice(0, 7).map((run) => `<tr style="cursor:pointer" data-run="${run.id}">
              <td><strong>${escapeHtml(run.appName)}</strong></td>
              <td><span class="tag teal">${icon('check', 12)}成功</span></td>
              <td class="mono">${run.totalDuration || 0}ms</td>
              <td class="muted">${formatTime(run.startedAt)}</td>
            </tr>`).join('')}</tbody>
          </table>` : '<div class="empty">还没有运行记录</div>'}
        </div>
      </section>
    </div>`
}

function appCard(app) {
  return `<div class="app-card">
    <div class="app-top">
      <div class="app-avatar" style="background:${app.color}">${icon(app.icon || 'bot')}</div>
      <div><div class="app-name">${escapeHtml(app.name)}</div><div class="app-type">${escapeHtml(app.type)}</div></div>
    </div>
    <div class="app-desc">${escapeHtml(app.desc)}</div>
    <div class="app-meta">
      <span>${app.runs || 0} 次运行 · ${formatTime(app.updatedAt)}</span>
      <div class="app-actions">
        <button class="icon-btn sm" title="打开工作流" data-action="open-flow" data-app="${app.id}">${icon('workflow')}</button>
        <button class="icon-btn sm" title="运行" data-action="quick-run" data-app="${app.id}">${icon('play')}</button>
        <button class="icon-btn sm" title="删除" data-action="delete-app" data-app="${app.id}">${icon('trash')}</button>
      </div>
    </div>
  </div>`
}

function showNewAppModal() {
  openModal({
    title: '新建应用',
    body: `
      <div class="field"><label>应用名称</label><input id="new-app-name" placeholder="例如：订单助手"></div>
      <div class="field"><label>应用类型</label>
        <select id="new-app-type">
          <option value="Agent">Agent</option>
          <option value="RAG">RAG</option>
          <option value="Workflow">Workflow</option>
        </select>
      </div>
      <div class="field"><label>描述</label><textarea id="new-app-desc" style="min-height:70px" placeholder="一句话说明这个应用做什么"></textarea></div>`,
    actions: `<button class="btn" data-close>取消</button><button class="btn primary" id="confirm-new-app">${icon('check')}创建</button>`,
  })
  $('#confirm-new-app').addEventListener('click', () => {
    const name = $('#new-app-name').value.trim() || '未命名应用'
    const type = $('#new-app-type').value
    const desc = $('#new-app-desc').value.trim()
    const palette = { Agent: '#7c3aed', RAG: '#2563eb', Workflow: '#0e7d72' }
    const icons = { Agent: 'bot', RAG: 'database', Workflow: 'sparkles' }
    const app = { id: uid('app'), name, type, color: palette[type], icon: icons[type], desc: desc || '新创建的 LLM 应用', runs: 0, updatedAt: Date.now() }
    state.apps.unshift(app)
    const flow = defaultFlowForType(type, name, app.id)
    state.workflows[flow.id] = flow
    persistState()
    closeModal()
    toast(`已创建 ${name}`)
    state.activeFlowId = flow.id
    go('workflow')
  })
}

function defaultFlowForType(type, name, appId) {
  const start = { id: uid('n'), type: 'start', x: 70, y: 220, data: { title: '开始', inputKeys: ['query'] } }
  const middle = []
  if (type === 'Agent') {
    middle.push({ id: uid('n'), type: 'agent', x: 350, y: 210, data: { title: 'Agent', task: '请完成以下任务：{{query}}', system: '你是一个能使用工具完成任务的智能体。', tools: ['knowledge_search', 'web_search', 'calculator'], maxSteps: 4 } })
  }
  else if (type === 'RAG') {
    middle.push({ id: uid('n'), type: 'retrieval', x: 350, y: 180, data: { title: '知识检索', query: '{{query}}', topK: 3, mode: 'hybrid' } })
    middle.push({ id: uid('n'), type: 'llm', x: 640, y: 220, data: { title: '生成回答', model: 'gpt-4o-mini', prompt: '根据知识回答：{{query}}\n\n知识：{{知识检索}}', temperature: 0.7 } })
  }
  else {
    middle.push({ id: uid('n'), type: 'llm', x: 350, y: 220, data: { title: 'LLM', model: 'gpt-4o-mini', prompt: '请回答：{{query}}', temperature: 0.7 } })
  }
  const end = { id: uid('n'), type: 'end', x: 350 + middle.length * 300, y: 220, data: { title: '结束', summary: `{{${middle[middle.length - 1].data.title}}}` } }
  const nodes = [start, ...middle, end]
  const edges = []
  let prev = start.id
  for (const node of middle) {
    edges.push({ id: uid('e'), from: prev, to: node.id })
    prev = node.id
  }
  edges.push({ id: uid('e'), from: prev, to: end.id })
  return { id: uid('wf'), appId, name, nodes, edges }
}

/* ---------------- Workflow studio ---------------- */

const studio = {
  flowId: null,
  flow: null,
  selectedNodeId: null,
  connecting: null,
  dragNode: null,
  runOpen: false,
  zoom: 1,
  history: [],
  historyIndex: -1,
}

function renderWorkflow(root) {
  const flowId = state.activeFlowId || Object.keys(state.workflows)[0]
  if (!flowId) {
    studio.flow = null
    updateTopbar({ title: '工作流', actions: `<button class="btn primary" data-action="new-app">${icon('plus')}先创建应用</button>` })
    root.innerHTML = '<div class="empty" style="margin:24px">还没有工作流，请先在概览创建应用。</div>'
    return
  }
  state.activeFlowId = flowId
  if (studio.flowId !== flowId) {
    studio.flowId = flowId
    studio.history = []
    studio.historyIndex = -1
    studio.zoom = 1
    studio.selectedNodeId = null
    studio.runOpen = false
  }
  studio.flow = state.workflows[flowId]
  const app = appById(studio.flow.appId)
  updateTopbar({
    title: '工作流',
    crumb: app ? app.name : '',
    hint: '拖拽节点，从右侧圆点拖出连线',
    actions: `<button class="btn" data-action="flow-back">${icon('dashboard')}返回概览</button><button class="btn primary" data-action="run-flow">${icon('play')}运行</button>`,
  })
  root.innerHTML = `
    <div class="studio-toolbar">
      <button class="icon-btn sm" data-action="flow-back" title="返回">${icon('chevron-right', 14).replace('m9 18', 'm15 18').replace('6-6-6-6', '6-6 6 6')}</button>
      <div><div class="flow-name">${escapeHtml(studio.flow.name)}</div><div class="flow-status">${studio.flow.nodes.length} 个节点 · ${studio.flow.edges.length} 条连线</div></div>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="undo" title="撤销" ${studio.historyIndex <= 0 ? 'disabled' : ''}>${icon('undo')}</button>
      <button class="icon-btn" data-action="redo" title="重做" ${studio.historyIndex >= studio.history.length - 1 ? 'disabled' : ''}>${icon('redo')}</button>
      <button class="btn" data-action="auto-layout">${icon('layers')}自动布局</button>
      <span class="toolbar-note" id="zoom-label">${Math.round(studio.zoom * 100)}%</span>
      <button class="icon-btn" data-action="zoom-out" title="缩小">-</button>
      <button class="icon-btn" data-action="zoom-in" title="放大">+</button>
      <button class="icon-btn" data-action="zoom-reset" title="重置缩放">${icon('refresh')}</button>
      <button class="btn" data-action="save-flow">${icon('save')}保存</button>
      <button class="btn primary" data-action="run-flow">${icon('play')}运行</button>
    </div>
    <div class="studio-body">
      <aside class="palette">
        <h3>节点</h3>
        ${Object.entries(NODE_TYPES).map(([type, def]) => `<button class="palette-item" data-node-type="${type}" title="${def.desc}"><span class="node-dot" style="background:${def.color}"></span>${def.label}</button>`).join('')}
        <h3 style="margin-top:18px">提示</h3>
        <p class="helper" style="margin:0 4px">点击节点加入画布；按住节点头部拖动；从右端圆点拖到另一节点的左端圆点即可连线。</p>
      </aside>
      <div class="canvas-wrap" id="canvas-wrap">
        <div class="canvas-grid" id="canvas-grid"></div>
      </div>
      <aside class="inspector" id="inspector"></aside>
    </div>`
  renderCanvas()
  renderInspector()
  if (studio.history.length === 0) pushHistory()
  $$('.palette-item', root).forEach((item) => {
    item.addEventListener('click', () => addNode(item.dataset.nodeType))
  })
}

function renderCanvas() {
  const grid = $('#canvas-grid')
  if (!grid || !studio.flow) return
  const nodes = studio.flow.nodes
  const edges = studio.flow.edges
  grid.innerHTML = `
    <svg class="edge-svg">
      ${edges.map(edgeMarkup).join('')}
      ${studio.connecting ? `<path class="edge-line temp" d="${studio.connecting.d}"/>` : ''}
    </svg>
    ${nodes.map(nodeMarkup).join('')}`
  grid.style.transform = `scale(${studio.zoom})`
  grid.style.transformOrigin = '0 0'
  attachCanvasEvents(grid)
}

function nodePosition(node) {
  return { x: node.x, y: node.y }
}

function edgeMarkup(edge) {
  const from = studio.flow.nodes.find((node) => node.id === edge.from)
  const to = studio.flow.nodes.find((node) => node.id === edge.to)
  if (!from || !to) return ''
  const sourceY = from.type === 'condition'
    ? (edge.sourceHandle === 'false' ? 44 : 24)
    : 32
  const p1 = { x: from.x + 198, y: from.y + sourceY }
  const p2 = { x: to.x, y: to.y + 32 }
  const d = `M ${p1.x} ${p1.y} C ${p1.x + 60} ${p1.y}, ${p2.x - 60} ${p2.y}, ${p2.x} ${p2.y}`
  return `<path class="edge-line" data-edge="${edge.id}" d="${d}"></path>`
}

function nodeMarkup(node) {
  const def = NODE_TYPES[node.type] || NODE_TYPES.llm
  const body = nodeBody(node)
  const selected = node.id === studio.selectedNodeId ? ' selected' : ''
  const running = state.replay.playing && node.id === activeReplayNodeId() ? ' running' : ''
  const conditionHandles = node.type === 'condition'
    ? '<span class="handle out true" data-handle="true" data-node="' + node.id + '" title="是"></span><span class="handle out false" data-handle="false" data-node="' + node.id + '" title="否"></span>'
    : '<span class="handle out" data-handle="out" data-node="' + node.id + '" title="输出"></span>'
  return `
    <div class="node node-${node.type}${selected}${running}" data-node-id="${node.id}" style="left:${node.x}px; top:${node.y}px">
      ${node.type !== 'start' ? `<span class="handle in" data-handle="in" data-node="${node.id}" title="输入"></span>` : ''}
      ${conditionHandles}
      <div class="node-head" data-node-drag="${node.id}">
        <span class="node-ic">${icon(def.icon)}</span>
        <span class="node-title">${escapeHtml(node.data.title || def.label)}</span>
      </div>
      <div class="node-body">${escapeHtml(body)}</div>
    </div>`
}

function nodeBody(node) {
  if (node.type === 'llm') return `模型 ${node.data.model || 'gpt-4o-mini'} · t=${node.data.temperature ?? 0.7}`
  if (node.type === 'retrieval') return `TopK ${node.data.topK || 3} · ${escapeHtml(node.data.query || '')}`
  if (node.type === 'agent') return `工具 ${(node.data.tools || []).length} 个 · 最多 ${node.data.maxSteps || 4} 步`
  if (node.type === 'condition') return `${escapeHtml(node.data.field || '')} ${escapeHtml(node.data.op || '')} ${escapeHtml(node.data.value || '')}`
  if (node.type === 'code') return `转换：${escapeHtml(node.data.transform || 'uppercase')}`
  if (node.type === 'end') return '输出最终结果'
  if (node.type === 'start') return '输入：' + (node.data.inputKeys || []).join(', ')
  return ''
}

function attachCanvasEvents(grid) {
  $$('.node', grid).forEach((el) => {
    el.addEventListener('mousedown', (event) => {
      if (event.target.closest('[data-handle]')) return
      if (event.target.closest('[data-node-drag]')) return
      const id = el.dataset.nodeId
      studio.selectedNodeId = id
      renderCanvas()
      renderInspector()
    })
  })

  $$('[data-node-drag]', grid).forEach((head) => {
    head.addEventListener('mousedown', (event) => {
      event.preventDefault()
      const id = head.dataset.nodeDrag
      const node = studio.flow.nodes.find((item) => item.id === id)
      studio.selectedNodeId = id
      renderInspector()
      const wrap = $('#canvas-wrap')
      const startX = event.clientX
      const startY = event.clientY
      const originX = node.x
      const originY = node.y
      studio.dragNode = { id, node, startX, startY, originX, originY }
      const move = (moveEvent) => {
        const dx = (moveEvent.clientX - studio.dragNode.startX) / studio.zoom
        const dy = (moveEvent.clientY - studio.dragNode.startY) / studio.zoom
        studio.dragNode.node.x = Math.max(0, studio.dragNode.originX + dx)
        studio.dragNode.node.y = Math.max(0, studio.dragNode.originY + dy)
        const el = $(`.node[data-node-id="${id}"]`, grid)
        if (el) {
          el.style.left = `${studio.dragNode.node.x}px`
          el.style.top = `${studio.dragNode.node.y}px`
        }
        renderEdgesOnly(grid)
      }
      const up = () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
        studio.dragNode = null
        pushHistory()
        persistWorkflow()
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    })
  })

  $$('[data-handle]', grid).forEach((handle) => {
    handle.addEventListener('mousedown', (event) => {
      event.preventDefault()
      event.stopPropagation()
      const nodeId = handle.dataset.node
      const node = studio.flow.nodes.find((item) => item.id === nodeId)
      const isIn = handle.dataset.handle === 'in'
      if (isIn) return
      const start = { x: node.x + 198, y: node.y + (handle.dataset.handle === 'true' ? 24 : handle.dataset.handle === 'false' ? 44 : 32) }
      studio.connecting = { from: nodeId, handle: handle.dataset.handle, d: `M ${start.x} ${start.y} L ${start.x} ${start.y}` }
      renderCanvas()
      const svg = $('.edge-svg', grid)
      const move = (moveEvent) => {
        const wrap = $('#canvas-wrap')
        const rect = wrap.getBoundingClientRect()
        const end = { x: (moveEvent.clientX - rect.left + wrap.scrollLeft) / studio.zoom, y: (moveEvent.clientY - rect.top + wrap.scrollTop) / studio.zoom }
        studio.connecting.d = `M ${start.x} ${start.y} C ${start.x + 60} ${start.y}, ${end.x - 60} ${end.y}, ${end.x} ${end.y}`
        const path = $('.edge-line.temp', grid)
        if (path) path.setAttribute('d', studio.connecting.d)
      }
      const up = (upEvent) => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
        const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)
        const targetHandle = target?.closest?.('[data-handle="in"]')
        if (targetHandle && targetHandle.dataset.node !== studio.connecting.from) {
          addEdge(studio.connecting.from, targetHandle.dataset.node, studio.connecting.handle)
        }
        studio.connecting = null
        renderCanvas()
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    })
  })

}

function renderEdgesOnly(grid) {
  const svg = $('.edge-svg', grid)
  if (!svg) return
  svg.innerHTML = studio.flow.edges.map(edgeMarkup).join('') + (studio.connecting ? `<path class="edge-line temp" d="${studio.connecting.d}"/>` : '')
}

function addNode(type) {
  pushHistory()
  const count = studio.flow.nodes.length
  const def = NODE_TYPES[type]
  const defaults = {
    start: { title: '开始', inputKeys: ['query'] },
    llm: { title: 'LLM', model: 'gpt-4o-mini', prompt: '请回答用户问题：{{query}}', temperature: 0.7 },
    retrieval: { title: '知识检索', query: '{{query}}', topK: 3 },
    agent: { title: 'Agent', task: '请完成以下任务：{{query}}', system: '你是一个能使用工具完成任务的智能体。', tools: ['knowledge_search', 'web_search', 'calculator'], maxSteps: 4 },
    condition: { title: '条件判断', field: '{{query}}', op: 'contains', value: '' },
    code: { title: '代码转换', transform: 'uppercase', value: '{{input}}' },
    end: { title: '结束', summary: '{{input}}' },
  }
  const node = { id: uid('n'), type, x: 180 + count * 24, y: 180 + count * 28, data: { ...defaults[type] } }
  studio.flow.nodes.push(node)
  studio.selectedNodeId = node.id
  persistWorkflow()
  renderCanvas()
  renderInspector()
}

function addEdge(from, to, handle = 'out') {
  if (studio.flow.edges.some((edge) => edge.from === from && edge.to === to)) return
  pushHistory()
  studio.flow.edges.push({ id: uid('e'), from, to, sourceHandle: handle })
  persistWorkflow()
}

function removeEdge(edgeId) {
  studio.flow.edges = studio.flow.edges.filter((edge) => edge.id !== edgeId)
}

function persistWorkflow() {
  if (!studio.flow) return
  state.workflows[studio.flow.id] = studio.flow
  persistState()
}

function flowSnapshot() {
  return JSON.stringify({ nodes: studio.flow.nodes, edges: studio.flow.edges })
}

function pushHistory() {
  if (!studio.flow) return
  const snapshot = flowSnapshot()
  if (studio.history[studio.historyIndex] === snapshot) return
  studio.history = studio.history.slice(0, studio.historyIndex + 1)
  studio.history.push(snapshot)
  studio.historyIndex = studio.history.length - 1
  updateToolbarButtons()
}

function restoreSnapshot(snapshot) {
  const data = JSON.parse(snapshot)
  studio.flow.nodes = data.nodes
  studio.flow.edges = data.edges
  persistWorkflow()
  renderCanvas()
  renderInspector()
  updateToolbarButtons()
}

function undo() {
  if (studio.historyIndex <= 0) return
  studio.historyIndex -= 1
  restoreSnapshot(studio.history[studio.historyIndex])
}

function redo() {
  if (studio.historyIndex >= studio.history.length - 1) return
  studio.historyIndex += 1
  restoreSnapshot(studio.history[studio.historyIndex])
}

function updateToolbarButtons() {
  const undoBtn = $('[data-action="undo"]')
  const redoBtn = $('[data-action="redo"]')
  if (undoBtn) undoBtn.disabled = studio.historyIndex <= 0
  if (redoBtn) redoBtn.disabled = studio.historyIndex >= studio.history.length - 1
}

function autoLayout() {
  if (!studio.flow) return
  pushHistory()
  const nodes = studio.flow.nodes
  const start = nodes.find((node) => node.type === 'start') || nodes[0]
  const layers = new Map()
  const queue = [{ id: start.id, layer: 0 }]
  const visited = new Set()
  while (queue.length) {
    const current = queue.shift()
    if (visited.has(current.id)) continue
    visited.add(current.id)
    layers.set(current.id, Math.max(layers.get(current.id) || 0, current.layer))
    const outgoing = studio.flow.edges.filter((edge) => edge.from === current.id)
    for (const edge of outgoing) {
      queue.push({ id: edge.to, layer: (layers.get(current.id) || current.layer) + 1 })
    }
  }
  const byLayer = new Map()
  for (const node of nodes) {
    const layer = layers.has(node.id) ? layers.get(node.id) : 0
    if (!byLayer.has(layer)) byLayer.set(layer, [])
    byLayer.get(layer).push(node)
  }
  let order = 0
  for (const [, list] of [...byLayer.entries()].sort((a, b) => a[0] - b[0])) {
    list.forEach((node, index) => {
      node.x = 80 + order * 300
      node.y = 90 + index * 150
    })
    order += 1
  }
  persistWorkflow()
  renderCanvas()
  renderInspector()
}

function setZoom(value) {
  studio.zoom = Math.min(1.5, Math.max(0.6, Math.round(value * 100) / 100))
  const label = $('#zoom-label')
  if (label) label.textContent = `${Math.round(studio.zoom * 100)}%`
  renderCanvas()
}

function renderInspector() {
  const panel = $('#inspector')
  if (!panel || !studio.flow) return
  const node = studio.flow.nodes.find((item) => item.id === studio.selectedNodeId)
  if (studio.runOpen) {
    panel.innerHTML = runPanelMarkup()
    attachRunPanelEvents()
    return
  }
  if (!node) {
    panel.innerHTML = `
      <div class="inspector-head"><span>检查器</span></div>
      <div class="inspector-body">
        <div class="helper">选择一个节点查看和编辑配置。右侧圆点是输出端口，拖到另一个节点左端即可连线。</div>
        <div class="divider"></div>
        <button class="btn blue" data-action="run-flow">${icon('play')}运行工作流</button>
        <div class="helper">运行结果会进入可观测性页面，并可用回放器逐步查看。</div>
      </div>`
    return
  }
  panel.innerHTML = nodeConfigMarkup(node)
  attachNodeConfigEvents(node)
}

function nodeConfigMarkup(node) {
  const def = NODE_TYPES[node.type]
  let fields = ''
  if (node.type === 'start') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field"><label>输入变量（逗号分隔）</label><input data-field="inputKeys" value="${escapeHtml((node.data.inputKeys || []).join(','))}"></div>`
  }
  if (node.type === 'llm') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field-row">
        <div class="field"><label>模型</label><input data-field="model" value="${escapeHtml(node.data.model)}"></div>
        <div class="field"><label>温度</label><input data-field="temperature" type="number" min="0" max="2" step="0.1" value="${node.data.temperature ?? 0.7}"></div>
      </div>
      <div class="field"><label>提示词</label><textarea data-field="prompt">${escapeHtml(node.data.prompt || '')}</textarea></div>
      <div>${['query', 'input', '知识检索'].map((v) => `<button class="var-chip" data-insert="${v}">{{${v}}}</button>`).join('')}</div>`
  }
  if (node.type === 'retrieval') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field"><label>查询模板</label><textarea data-field="query">${escapeHtml(node.data.query || '')}</textarea></div>
      <div class="field-row">
        <div class="field"><label>检索模式</label><select data-field="mode">
          <option value="hybrid" ${node.data.mode !== 'keyword' && node.data.mode !== 'vector' ? 'selected' : ''}>混合检索</option>
          <option value="keyword" ${node.data.mode === 'keyword' ? 'selected' : ''}>关键词</option>
          <option value="vector" ${node.data.mode === 'vector' ? 'selected' : ''}>向量近似</option>
        </select></div>
        <div class="field"><label>召回数量 TopK</label><input data-field="topK" type="number" min="1" max="10" value="${node.data.topK || 3}"></div>
      </div>`
  }
  if (node.type === 'agent') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field"><label>任务模板</label><textarea data-field="task">${escapeHtml(node.data.task || '')}</textarea></div>
      <div class="field"><label>系统提示</label><textarea data-field="system">${escapeHtml(node.data.system || '')}</textarea></div>
      <div class="field-row">
        <div class="field"><label>最大步数</label><input data-field="maxSteps" type="number" min="1" max="8" value="${node.data.maxSteps || 4}"></div>
      </div>
      <div class="field"><label>可用工具</label>
        <div class="helper" style="margin-bottom:8px">至少选择一种工具，Agent 会按任务自动规划调用。</div>
        ${['knowledge_search', 'web_search', 'calculator'].map((tool) => `<label class="var-chip" style="cursor:pointer; display:inline-flex; align-items:center; gap:5px"><input type="checkbox" data-tool="${tool}" ${(node.data.tools || []).includes(tool) ? 'checked' : ''}>${tool}</label>`).join('')}
      </div>`
  }
  if (node.type === 'condition') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field"><label>判断字段</label><input data-field="field" value="${escapeHtml(node.data.field)}"></div>
      <div class="field-row">
        <div class="field"><label>运算符</label><select data-field="op">
          <option value="contains" ${node.data.op === 'contains' ? 'selected' : ''}>包含</option>
          <option value="equals" ${node.data.op === 'equals' ? 'selected' : ''}>等于</option>
          <option value="not_empty" ${node.data.op === 'not_empty' ? 'selected' : ''}>非空</option>
        </select></div>
        <div class="field"><label>比较值</label><input data-field="value" value="${escapeHtml(node.data.value || '')}"></div>
      </div>
      <div class="helper">条件为真走绿色「是」端口，否则走红色「否」端口。</div>`
  }
  if (node.type === 'code') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field"><label>转换方式</label><select data-field="transform">
        <option value="uppercase" ${node.data.transform === 'uppercase' ? 'selected' : ''}>转大写</option>
        <option value="lowercase" ${node.data.transform === 'lowercase' ? 'selected' : ''}>转小写</option>
        <option value="length" ${node.data.transform === 'length' ? 'selected' : ''}>计算长度</option>
        <option value="json" ${node.data.transform === 'json' ? 'selected' : ''}>JSON 序列化</option>
      </select></div>
      <div class="field"><label>输入模板</label><input data-field="value" value="${escapeHtml(node.data.value || '{{input}}')}"></div>`
  }
  if (node.type === 'end') {
    fields = `<div class="field"><label>标题</label><input data-field="title" value="${escapeHtml(node.data.title)}"></div>
      <div class="field"><label>输出模板</label><textarea data-field="summary">${escapeHtml(node.data.summary || '{{input}}')}</textarea></div>`
  }
  return `
    <div class="inspector-head">
      <span style="display:flex;align-items:center;gap:8px"><span class="node-dot" style="width:10px;height:10px;border-radius:3px;background:${def.color};display:inline-block"></span>${def.label}</span>
      <button class="icon-btn sm" title="删除节点" data-action="delete-node">${icon('trash')}</button>
    </div>
    <div class="inspector-body">
      <div class="helper">${def.desc}</div>
      <div class="divider"></div>
      ${fields}
    </div>`
}

function attachNodeConfigEvents(node) {
  $$('#inspector [data-field]').forEach((input) => {
    const apply = () => {
      const field = input.dataset.field
      if (field === 'temperature') node.data[field] = Number(input.value)
      else if (field === 'topK') node.data[field] = Number(input.value)
      else if (field === 'maxSteps') node.data[field] = Number(input.value)
      else if (field === 'inputKeys') node.data[field] = input.value.split(',').map((item) => item.trim()).filter(Boolean)
      else node.data[field] = input.value
      persistWorkflow()
      renderCanvas()
    }
    input.addEventListener('change', apply)
    input.addEventListener('blur', apply)
  })
  $$('#inspector [data-tool]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const tools = node.data.tools || []
      if (checkbox.checked && !tools.includes(checkbox.dataset.tool)) tools.push(checkbox.dataset.tool)
      if (!checkbox.checked) node.data.tools = tools.filter((tool) => tool !== checkbox.dataset.tool)
      else node.data.tools = tools
      persistWorkflow()
      renderCanvas()
    })
  })
  $$('#inspector [data-insert]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const textarea = $('#inspector textarea[data-field="prompt"]')
      if (!textarea) return
      const value = chip.dataset.insert
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      textarea.value = textarea.value.slice(0, start) + value + textarea.value.slice(end)
      textarea.focus()
      textarea.setSelectionRange(start + value.length, start + value.length)
      textarea.dispatchEvent(new Event('change'))
    })
  })
  const deleteButton = $('#inspector [data-action="delete-node"]')
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      pushHistory()
      studio.flow.nodes = studio.flow.nodes.filter((item) => item.id !== node.id)
      studio.flow.edges = studio.flow.edges.filter((edge) => edge.from !== node.id && edge.to !== node.id)
      studio.selectedNodeId = null
      persistWorkflow()
      renderCanvas()
      renderInspector()
    })
  }
}

function runPanelMarkup() {
  const startNode = studio.flow.nodes.find((node) => node.type === 'start')
  const keys = startNode?.data?.inputKeys || ['query']
  const sample = Object.fromEntries(keys.map((key) => [key, key === 'query' ? '我收到商品三天了，可以退款吗？' : '']))
  return `
    <div class="inspector-head"><span>运行</span><button class="icon-btn sm" data-action="close-run" title="关闭">${icon('x')}</button></div>
    <div class="inspector-body">
      <div class="field"><label>输入参数</label><textarea id="run-inputs" style="min-height:110px">${escapeHtml(JSON.stringify(sample, null, 2))}</textarea></div>
      <div class="helper">输入为 JSON 对象，键名对应开始节点的输入变量。</div>
      <button class="btn primary" id="stream-run" style="justify-content:center">${icon('zap')}流式运行</button>
      <button class="btn" id="start-run" style="justify-content:center">${icon('play')}普通运行</button>
      <div class="divider"></div>
      <div id="run-result"><div class="helper">执行后这里会展示每一步的耗时与结果。</div></div>
    </div>`
}

function attachRunPanelEvents() {
  $('#inspector [data-action="close-run"]').addEventListener('click', () => {
    studio.runOpen = false
    renderInspector()
  })
  $('#start-run').addEventListener('click', async () => {
    const button = $('#start-run')
    const inputs = readRunInputs(button)
    if (!inputs) return
    button.disabled = true
    button.innerHTML = `${icon('refresh')}执行中...`
    const run = await executeRun(studio.flow, inputs)
    button.disabled = false
    button.innerHTML = `${icon('play')}普通运行`
    if (run) {
      $('#run-result').innerHTML = runResultMarkup(run)
      toast('运行完成，已写入可观测性')
    }
  })
  $('#stream-run').addEventListener('click', async () => {
    const button = $('#stream-run')
    const inputs = readRunInputs(button)
    if (!inputs) return
    button.disabled = true
    button.innerHTML = `${icon('refresh')}流式运行中...`
    const result = $('#run-result')
    result.innerHTML = `<div class="section-title">${icon('zap')}实时输出</div>
      <div id="stream-trace" style="display:flex;flex-direction:column;gap:8px"></div>
      <div id="stream-final" class="helper"></div>`
    const run = await streamRun(studio.flow, inputs, result)
    button.disabled = false
    button.innerHTML = `${icon('zap')}流式运行`
    if (run) toast('流式运行完成')
  })
}

function readRunInputs(button) {
  try {
    return JSON.parse($('#run-inputs').value)
  }
  catch {
    toast('输入不是合法 JSON', 'err')
    button.disabled = false
    return null
  }
}

async function streamRun(flow, inputs, resultEl) {
  if (FILE_PROTOCOL) return streamRunLocal(flow, inputs, resultEl)
  const payload = {
    workflow: { nodes: flow.nodes, edges: flow.edges },
    inputs,
    settings: state.settings,
    knowledge: state.docs.map((doc) => ({ id: doc.id, title: doc.title, chunks: chunkDocument(doc) })),
  }
  const traceEl = $('#stream-trace')
  const finalEl = $('#stream-final')
  let liveBlock = null
  let run = null
  const addBlock = (label) => {
    const block = document.createElement('div')
    block.className = 'run-step'
    block.innerHTML = `<div class="step-main"><div class="step-title">${escapeHtml(label)}</div><div class="step-out"></div></div>`
    traceEl.appendChild(block)
    return block.querySelector('.step-out')
  }
  try {
    const response = await fetch('/api/run/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok || !response.body) throw new Error(await response.text())
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop()
      for (const part of parts) {
        const line = part.split('\n').find((item) => item.startsWith('data: '))
        if (!line) continue
        const event = JSON.parse(line.slice(6))
        if (event.type === 'step') {
          liveBlock = addBlock(`${event.step.name} · ${event.step.meta.durationMs}ms`)
          if (event.step.type !== 'llm') liveBlock.textContent = previewOutput(event.step)
        }
        if (event.type === 'token') {
          if (!liveBlock) liveBlock = addBlock(event.name)
          liveBlock.textContent += event.text
        }
        if (event.type === 'done') run = event.run
      }
    }
    if (run) {
      const app = appById(flow.appId)
      run = { ...run, appId: flow.appId, appName: app?.name || flow.name, workflowId: flow.id, inputs, startedAt: Date.now() }
      state.runs.unshift(run)
      if (app) app.runs = (app.runs || 0) + 1
      persistState()
      finalEl.innerHTML = `共 ${run.steps.length} 步 · ${run.totalDuration}ms · ${run.totalTokens} tokens
        <div style="margin-top:8px"><button class="btn blue sm" data-action="view-run" data-run="${run.id}">${icon('eye')}查看回放</button></div>`
    }
    return run
  }
  catch (error) {
    return streamRunLocal(flow, inputs, resultEl)
  }
}

async function streamRunLocal(flow, inputs, resultEl) {
  const traceEl = $('#stream-trace')
  const finalEl = $('#stream-final')
  let liveBlock = null
  const addBlock = (label) => {
    const block = document.createElement('div')
    block.className = 'run-step'
    block.innerHTML = `<div class="step-main"><div class="step-title">${escapeHtml(label)}</div><div class="step-out"></div></div>`
    traceEl.appendChild(block)
    return block.querySelector('.step-out')
  }
  const run = await runWorkflowLocally(flow, inputs, (event) => {
    if (event.type === 'step') {
      liveBlock = addBlock(`${event.step.name} · ${event.step.meta.durationMs}ms`)
      if (event.step.type !== 'llm') liveBlock.textContent = previewOutput(event.step)
    }
    if (event.type === 'token') {
      if (!liveBlock) liveBlock = addBlock(event.name)
      liveBlock.textContent += event.text
    }
  })
  const app = appById(flow.appId)
  const stored = { ...run, appId: flow.appId, appName: app?.name || flow.name, workflowId: flow.id, inputs, startedAt: Date.now() }
  state.runs.unshift(stored)
  if (app) app.runs = (app.runs || 0) + 1
  persistState()
  finalEl.innerHTML = `共 ${stored.steps.length} 步 · ${stored.totalDuration}ms · ${stored.totalTokens} tokens
    <div style="margin-top:8px"><button class="btn blue sm" data-action="view-run" data-run="${stored.id}">${icon('eye')}查看回放</button></div>`
  return stored
}

function resolveTemplateClient(value, context) {
  if (typeof value !== 'string') return value
  return value.replace(/\{\{\s*([\w\u4e00-\u9fff.-]+)\s*\}\}/g, (_, key) => {
    const found = context[key]
    if (found === undefined || found === null) return ''
    if (typeof found === 'object') return JSON.stringify(found)
    return String(found)
  })
}

function hashStringClient(text) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function simulateCompletionClient(prompt, context) {
  const seed = hashStringClient(prompt)
  const subject = (context && context.query) || prompt
  const openings = [
    `好的，我已经理解你的问题：${subject}。`,
    `关于“${subject}”，我的建议如下。`,
    `收到。针对“${subject}”，可以这样处理。`,
    `这个问题可以拆成三步来回答，先看结论：${subject}。`,
  ]
  const followUps = ['建议先核对关键信息，再执行下一步。', '如果情况复杂，优先选择影响面最小、可回滚的方案。', '同时保留一份记录，便于后续复盘和持续优化。', '执行后请观察结果，并在异常时及时回退。']
  return `${openings[seed % openings.length]}\n${followUps[Math.floor(seed / 7) % followUps.length]}\n\n以上回复由 Loom 本地模拟引擎生成。`
}

function clientKeywordScore(query, text) {
  const terms = String(query).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1)
  const haystack = String(text).toLowerCase()
  let score = 0
  for (const term of terms) if (haystack.includes(term)) score += 1 + term.length / 4
  return score
}

function clientBigramVector(text) {
  const normalized = String(text || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  const vector = new Map()
  for (let i = 0; i < normalized.length - 1; i += 1) {
    const gram = normalized.slice(i, i + 2)
    vector.set(gram, (vector.get(gram) || 0) + 1)
  }
  return vector
}

function clientVectorScore(query, text) {
  const q = clientBigramVector(query)
  const t = clientBigramVector(text)
  if (!q.size || !t.size) return 0
  let dot = 0
  let qMag = 0
  let tMag = 0
  for (const [gram, weight] of t) {
    tMag += weight * weight
    dot += (q.get(gram) || 0) * weight
  }
  for (const weight of q.values()) qMag += weight * weight
  if (!qMag || !tMag) return 0
  return dot / Math.sqrt(qMag * tMag)
}

function clientRankChunks(query, chunks, mode, topK) {
  return chunks
    .map((chunk) => {
      const keyword = clientKeywordScore(query, chunk.text)
      const vector = clientVectorScore(query, chunk.text)
      const base = mode === 'keyword' ? keyword : mode === 'vector' ? vector : keyword * 0.55 + vector * 0.45
      const density = Math.min(1, keyword / Math.max(1, chunk.text.length / 80))
      return { ...chunk, score: base * (1 + density * 0.35) }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

function clientAgent(node, context, docs) {
  const task = resolveTemplateClient(node.data?.task || '{{input}}', context)
  const enabled = Array.isArray(node.data?.tools) ? node.data.tools : ['knowledge_search']
  const chunks = []
  for (const doc of docs) for (const chunk of doc.chunks || []) chunks.push({ ...chunk, docTitle: doc.title })
  const trace = []
  let answer = ''
  const maxSteps = Number(node.data?.maxSteps || 4)
  for (let step = 1; step <= maxSteps; step += 1) {
    const hasMath = /[-+]?\d+(?:\.\d+)?\s*[-+*/]\s*[-+]?\d+(?:\.\d+)?/.test(String(task))
    let action = 'finish'
    let observation = ''
    if (step === 1) {
      if (hasMath && enabled.includes('calculator')) action = 'calculator'
      else if (chunks.length && enabled.includes('knowledge_search')) action = 'knowledge_search'
      else if (enabled.includes('web_search')) action = 'web_search'
    }
    else if (step === 2 && enabled.includes('web_search') && !answer) action = 'web_search'
    const thought = step === 1 ? `先分析任务“${String(task).slice(0, 80)}”，并尝试调用可用工具。` : '工具结果已经拿到，现在把信息整理成可执行的答案。'
    if (action === 'calculator') {
      const match = String(task).match(/[-+]?\d+(?:\.\d+)?\s*[-+*/]\s*[-+]?\d+(?:\.\d+)?/)
      observation = match ? `${match[0]} = ${safeCalcClient(match[0])}` : '没有找到可计算表达式。'
      trace.push({ step, thought, action, tool: '计算器', observation })
    }
    else if (action === 'knowledge_search') {
      const ranked = clientRankChunks(task, chunks, 'hybrid', 2)
      observation = ranked.length ? ranked.map((chunk) => `[${chunk.docTitle}] ${chunk.text.slice(0, 160)}`).join('\n') : '知识库中没有匹配内容。'
      trace.push({ step, thought, action, tool: '知识检索', observation })
    }
    else if (action === 'web_search') {
      observation = `找到 ${Math.max(1, String(task).length % 4)} 条与问题相关的模拟网页结果。`
      trace.push({ step, thought, action, tool: '联网搜索', observation })
    }
    else {
      answer = simulateCompletionClient(`请回答：${task}`, context)
      trace.push({ step, thought, action: 'finish', tool: '完成', observation: answer })
      break
    }
  }
  if (!answer) {
    answer = simulateCompletionClient(`请回答：${task}`, context)
    trace.push({ step: maxSteps, thought: '达到最大步数，直接给出答案。', action: 'finish', tool: '完成', observation: answer })
  }
  return { answer, task, trace, tools: enabled, iterations: trace.length }
}

function safeCalcClient(expression) {
  const cleaned = String(expression || '').replace(/[^0-9+\-*/().\s]/g, '')
  if (!cleaned || !/^[0-9+\-*/().\s]+$/.test(cleaned)) return null
  try {
    const result = Function(`"use strict"; return (${cleaned})`)()
    return Number.isFinite(result) ? result : null
  }
  catch {
    return null
  }
}

async function runWorkflowLocally(flow, inputs, onEvent) {
  const nodes = flow.nodes
  const edges = flow.edges
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const adjacency = new Map(nodes.map((node) => [node.id, []]))
  for (const edge of edges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, [])
    adjacency.get(edge.from).push(edge)
  }
  const start = nodes.find((node) => node.type === 'start') || nodes[0]
  const context = { ...inputs }
  const steps = []
  const visited = new Set()
  const docs = state.docs.map((doc) => ({ id: doc.id, title: doc.title, chunks: chunkDocument(doc) }))

  async function visit(nodeId) {
    if (!nodeId || visited.has(nodeId)) return
    const node = byId.get(nodeId)
    if (!node) return
    visited.add(nodeId)
    const startedAt = Date.now()
    const title = node.data?.title || node.type
    let output = ''
    let meta = { durationMs: 0, tokens: 0, cost: 0 }
    if (node.type === 'start') {
      output = { ...inputs }
      meta.durationMs = 2
    }
    else if (node.type === 'llm') {
      const prompt = resolveTemplateClient(node.data?.prompt || '', context)
      await new Promise((done) => setTimeout(done, 60 + (hashStringClient(prompt) % 120)))
      output = simulateCompletionClient(prompt, context)
      meta.tokens = Math.max(1, Math.ceil(prompt.length / 2)) + Math.max(1, Math.ceil(output.length / 2))
      meta.cost = Math.round(meta.tokens / 1000 * 0.002 * 10000) / 10000
      if (onEvent) {
        for (let i = 0; i < output.length; i += 2) {
          onEvent({ type: 'token', nodeId: node.id, name: title, text: output.slice(i, i + 2) })
          await new Promise((done) => setTimeout(done, 8))
        }
      }
    }
    else if (node.type === 'retrieval') {
      const query = resolveTemplateClient(node.data?.query || '', context)
      const topK = Number(node.data?.topK || 3)
      const mode = node.data?.mode || 'hybrid'
      const allChunks = []
      for (const doc of docs) for (const chunk of doc.chunks || []) allChunks.push({ ...chunk, docTitle: doc.title, docId: doc.id })
      const ranked = clientRankChunks(query, allChunks, mode, topK)
      const text = ranked.map((chunk) => `[${chunk.docTitle}] ${chunk.text.slice(0, 180)}`).join('\n')
      output = { query, mode, chunks: ranked, text, answer: ranked.length ? `检索到 ${ranked.length} 个相关片段，来自《${ranked[0].docTitle}》等文档。` : '未检索到相关知识。' }
      meta.tokens = Math.max(1, Math.ceil(query.length / 2))
    }
    else if (node.type === 'agent') {
      output = clientAgent(node, context, docs)
      meta.tokens = Math.max(1, Math.ceil((node.data?.task || '').length / 2)) + output.trace.reduce((sum, item) => sum + Math.max(1, Math.ceil((item.observation || '').length / 2)), 0)
      meta.cost = Math.round(meta.tokens / 1000 * 0.004 * 10000) / 10000
    }
    else if (node.type === 'condition') {
      const field = String(resolveTemplateClient(node.data?.field || '', context))
      const op = node.data?.op || 'contains'
      const expected = String(resolveTemplateClient(node.data?.value || '', context))
      const branch = op === 'not_empty' ? field.trim().length > 0 : op === 'equals' ? field === expected : field.toLowerCase().includes(expected.toLowerCase())
      output = { branch, result: branch ? '是' : '否' }
      meta.durationMs = 4
    }
    else if (node.type === 'code') {
      const value = resolveTemplateClient(node.data?.value || '{{input}}', context)
      const transform = node.data?.transform || 'uppercase'
      if (transform === 'uppercase') output = value.toUpperCase()
      else if (transform === 'lowercase') output = value.toLowerCase()
      else if (transform === 'length') output = `长度：${value.length}`
      else output = JSON.stringify(value)
      meta.durationMs = 5
    }
    else if (node.type === 'end') {
      output = resolveTemplateClient(node.data?.summary || '{{input}}', context)
      meta.durationMs = 3
    }
    else {
      output = resolveTemplateClient(node.data?.prompt || '{{input}}', context)
    }
    meta.durationMs = meta.durationMs || Math.max(6, Date.now() - startedAt)
    steps.push({ id: `step-${steps.length + 1}`, nodeId: node.id, name: title, type: node.type, input: { ...context }, output, meta })
    if (onEvent) onEvent({ type: 'step', step: steps[steps.length - 1] })
    context[node.id] = output
    context[title] = node.type === 'retrieval' || node.type === 'agent' ? (output.text || output.answer) : output
    const outgoing = adjacency.get(nodeId) || []
    if (node.type === 'condition') {
      const branchKey = output.branch ? 'true' : 'false'
      for (const edge of outgoing) if ((edge.sourceHandle || 'true') === branchKey) await visit(edge.to)
    }
    else {
      for (const edge of outgoing) await visit(edge.to)
    }
  }

  if (start) await visit(start.id)
  const run = {
    id: `run-${Math.random().toString(36).slice(2, 10)}`,
    status: 'success',
    output: steps[steps.length - 1]?.output,
    steps,
    totalTokens: steps.reduce((sum, step) => sum + (step.meta.tokens || 0), 0),
    totalCost: steps.reduce((sum, step) => sum + (step.meta.cost || 0), 0),
    totalDuration: steps.reduce((sum, step) => sum + (step.meta.durationMs || 0), 0),
  }
  if (onEvent) onEvent({ type: 'done', run })
  return run
}

async function executeRun(flow, inputs, record = true) {
  if (FILE_PROTOCOL) {
    const data = await runWorkflowLocally(flow, inputs)
    return finalizeRun(data, flow, inputs, record)
  }
  const payload = {
    workflow: { nodes: flow.nodes, edges: flow.edges },
    inputs,
    settings: state.settings,
    knowledge: state.docs.map((doc) => ({ id: doc.id, title: doc.title, chunks: chunkDocument(doc) })),
  }
  try {
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error(await response.text())
    const data = await response.json()
    return finalizeRun(data, flow, inputs, record)
  }
  catch {
    const data = await runWorkflowLocally(flow, inputs)
    return finalizeRun(data, flow, inputs, record)
  }
}

function finalizeRun(data, flow, inputs, record) {
  const app = appById(flow.appId)
  const run = {
    ...data,
    appId: flow.appId,
    appName: app?.name || flow.name,
    workflowId: flow.id,
    inputs,
    startedAt: Date.now(),
  }
  if (record) {
    state.runs.unshift(run)
    if (app) app.runs = (app.runs || 0) + 1
    persistState()
  }
  return run
}

function runResultMarkup(run) {
  return `
    <div class="section-title">${icon('activity')}执行结果</div>
    <div class="helper">共 ${run.steps.length} 步 · ${run.totalDuration}ms · ${run.totalTokens} tokens</div>
    <div style="display:flex;flex-direction:column">
      ${run.steps.map((step, index) => `<div class="run-step">
        <span class="step-badge" style="background:${NODE_TYPES[step.type]?.color || '#475569'}">${index + 1}</span>
        <div class="step-main">
          <div class="step-title">${escapeHtml(step.name)}</div>
          <div class="step-meta">${step.meta.durationMs}ms · ${step.meta.tokens} tokens</div>
          <div class="step-out">${escapeHtml(previewOutput(step))}</div>
          ${step.type === 'agent' ? agentTraceMarkup(step) : ''}
        </div>
      </div>`).join('')}
    </div>
    <button class="btn blue" data-action="view-run" data-run="${run.id}">${icon('eye')}查看回放</button>`
}

function previewOutput(step) {
  const out = step.output
  if (out && typeof out === 'object') {
    if (step.type === 'agent') return out.answer || '（Agent 未返回答案）'
    return out.answer || out.text || JSON.stringify(out).slice(0, 240)
  }
  return out || ''
}

function agentTraceMarkup(step) {
  const trace = step.output?.trace || []
  if (!trace.length) return ''
  return `<div style="margin-top:6px; display:flex; flex-direction:column; gap:4px">
    ${trace.map((item) => `<div class="helper"><span class="tag" style="margin-right:5px">${escapeHtml(item.tool || item.action)}</span>${escapeHtml(String(item.observation || '').slice(0, 90))}</div>`).join('')}
  </div>`
}

function activeReplayNodeId() {
  return null
}

/* ---------------- Prompt lab ---------------- */

const lab = {
  variantA: '你是客服助手，请友好地回答问题：\n\n{{query}}',
  variantB: '你是一位严谨的专家。先分析，再分点回答：\n\n{{query}}',
  cases: [
    { id: 'case-1', name: '退款咨询', input: '我收到商品三天了，可以退款吗？' },
    { id: 'case-2', name: '产品询问', input: 'Loom Studio 支持哪些模型？' },
    { id: 'case-3', name: '情绪安抚', input: '为什么我的订单还没有发货？我很着急。' },
  ],
  results: null,
}

function renderLab(root) {
  updateTopbar({
    title: 'Prompt 实验室',
    crumb: '开发 / Prompt 实验室',
    hint: '用同一组用例对比两个提示词版本',
    actions: `<button class="btn" data-action="lab-reset">${icon('undo')}重置</button><button class="btn primary" data-action="lab-run">${icon('compare')}运行对比</button>`,
  })
  root.innerHTML = `
    <div class="lab-grid">
      <div class="card card-pad">
        <div class="variant-head"><span class="tag blue">版本 A</span><span class="v-name">客服口吻</span></div>
        <textarea class="prompt-box" id="variant-a">${escapeHtml(lab.variantA)}</textarea>
      </div>
      <div class="card card-pad">
        <div class="variant-head"><span class="tag violet">版本 B</span><span class="v-name">专家分点</span></div>
        <textarea class="prompt-box" id="variant-b">${escapeHtml(lab.variantB)}</textarea>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-pad" style="border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between">
        <div class="section-title" style="margin:0">${icon('file-text')}测试用例</div>
        <button class="btn sm" data-action="lab-add-case">${icon('plus')}添加用例</button>
      </div>
      <div class="card-pad">
        <table class="table">
          <thead><tr><th>用例</th><th>输入</th><th style="width:60px"></th></tr></thead>
          <tbody>
            ${lab.cases.map((item) => `<tr>
              <td><strong>${escapeHtml(item.name)}</strong></td>
              <td class="mono" style="font-size:12px">${escapeHtml(item.input)}</td>
              <td><button class="icon-btn sm" title="删除" data-action="lab-del-case" data-case="${item.id}">${icon('trash')}</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div id="lab-results" style="margin-top:16px"></div>`
}

async function runLab() {
  const variantA = $('#variant-a').value
  const variantB = $('#variant-b').value
  lab.variantA = variantA
  lab.variantB = variantB
  const resultsWrap = $('#lab-results')
  resultsWrap.innerHTML = '<div class="empty">正在对两个版本运行同一组用例...</div>'
  const rows = []
  for (const item of lab.cases) {
    const flowA = labFlow('版本 A', variantA)
    const flowB = labFlow('版本 B', variantB)
    const [runA, runB] = await Promise.all([
      executeRun(flowA, { query: item.input }, false),
      executeRun(flowB, { query: item.input }, false),
    ])
    const outA = lastOutput(runA)
    const outB = lastOutput(runB)
    rows.push({ item, runA, runB, outA, outB })
  }
  lab.results = rows
  renderLabResults(rows)
  toast('对比完成')
}

function labFlow(title, prompt) {
  return {
    id: uid('lab'),
    appId: 'lab',
    name: title,
    nodes: [
      { id: 'ls', type: 'start', x: 0, y: 0, data: { title: '开始', inputKeys: ['query'] } },
      { id: 'll', type: 'llm', x: 0, y: 0, data: { title, model: state.settings.model, prompt, temperature: 0.7 } },
      { id: 'le', type: 'end', x: 0, y: 0, data: { title: '结束', summary: `{{${title}}}` } },
    ],
    edges: [
      { id: 'l1', from: 'ls', to: 'll' },
      { id: 'l2', from: 'll', to: 'le' },
    ],
  }
}

function lastOutput(run) {
  if (!run) return '（运行失败）'
  const step = run.steps.find((item) => item.type === 'end') || run.steps[run.steps.length - 1]
  return typeof step.output === 'string' ? step.output : JSON.stringify(step.output)
}

function renderLabResults(rows) {
  const wrap = $('#lab-results')
  const score = (text) => Math.min(100, 20 + text.length / 3 + (text.includes('点') ? 8 : 0) + (text.length > 60 ? 10 : 0))
  wrap.innerHTML = `
    <div class="section-title">${icon('compare')}对比结果与质量评分</div>
    <div class="card">
      <table class="table">
        <thead><tr><th>用例</th><th style="width:46%">版本 A</th><th style="width:46%">版本 B</th><th>评分 A/B</th></tr></thead>
        <tbody>
          ${rows.map(({ item, runA, runB, outA, outB }) => {
            const sa = Math.round(score(outA))
            const sb = Math.round(score(outB))
            return `<tr>
              <td><strong>${escapeHtml(item.name)}</strong><div class="muted" style="font-size:11px">${runA?.totalDuration || 0}ms / ${runB?.totalDuration || 0}ms</div></td>
              <td class="step-out">${diffHtml(outA, outB, 'a')}</td>
              <td class="step-out">${diffHtml(outA, outB, 'b')}</td>
              <td class="score-cell"><span class="tag ${sa >= sb ? 'teal' : 'amber'}">A ${sa}</span> <span class="tag ${sb >= sa ? 'teal' : 'amber'}">B ${sb}</span></td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="helper" style="margin-top:10px">差异文本以绿色表示新增、红色表示删除；评分综合长度、结构与表达质量，仅用于本地对比。</div>`
}

function diffHtml(a, b, side) {
  const source = side === 'a' ? a : b
  const other = side === 'a' ? b : a
  if (source === other) return escapeHtml(source)
  const parts = source.split(/(\s+)/)
  let otherWords = other.split(/\s+/)
  return parts.map((part) => {
    if (/^\s+$/.test(part)) return part
    const index = otherWords.indexOf(part)
    if (index >= 0) {
      otherWords[index] = null
      return escapeHtml(part)
    }
    return `<span class="${side === 'a' ? 'diff-add' : 'diff-del'}">${escapeHtml(part)}</span>`
  }).join('')
}

/* ---------------- Knowledge base ---------------- */

function chunkDocument(doc) {
  const size = doc.chunkSize || 180
  const text = String(doc.content || '').replace(/\r/g, '')
  const sentences = text.split(/\n+/).flatMap((block) => block.split(/(?<=[。！？.!?])\s*/))
  const chunks = []
  let current = ''
  let order = 0
  for (const sentence of sentences) {
    if ((current + sentence).length > size && current) {
      chunks.push({ id: `${doc.id}-c${order + 1}`, order, text: current.trim() })
      order += 1
      current = sentence
    }
    else {
      current += sentence
    }
  }
  if (current.trim()) chunks.push({ id: `${doc.id}-c${order + 1}`, order, text: current.trim() })
  return chunks.length ? chunks : [{ id: `${doc.id}-c1`, order: 0, text }]
}

function renderKnowledge(root) {
  updateTopbar({
    title: '知识库',
    crumb: '开发 / 知识库',
    hint: `${state.docs.length} 个文档 · 分块与命中测试`,
    actions: `<button class="btn primary" data-action="doc-add">${icon('plus')}上传文档</button>`,
  })
  root.innerHTML = `
    <div class="dash-grid">
      <section>
        <div class="section-title">${icon('database')}文档</div>
        <div class="doc-list">
          ${state.docs.length ? state.docs.map(docMarkup).join('') : '<div class="empty">还没有文档</div>'}
        </div>
      </section>
      <section>
        <div class="section-title">${icon('search')}命中测试</div>
        <div class="card card-pad">
          <div class="field"><label>查询</label><input id="hit-query" placeholder="例如：如何退款"></div>
          <button class="btn primary" data-action="hit-test" style="justify-content:center; margin-top:10px">${icon('search')}测试检索</button>
          <div id="hit-results" style="margin-top:14px"><div class="helper">输入查询，查看知识库会召回哪些分块。</div></div>
        </div>
      </section>
    </div>`
}

function docMarkup(doc) {
  const chunks = chunkDocument(doc)
  return `<div class="doc-item">
    <span class="doc-icon">${icon('file-text')}</span>
    <div class="doc-main">
      <div class="doc-name">${escapeHtml(doc.title)}</div>
      <div class="doc-sub">${chunks.length} 个分块 · 创建于 ${formatTime(doc.createdAt)}</div>
    </div>
    <button class="icon-btn sm" title="查看分块" data-action="doc-view" data-doc="${doc.id}">${icon('eye')}</button>
    <button class="icon-btn sm" title="删除" data-action="doc-delete" data-doc="${doc.id}">${icon('trash')}</button>
  </div>`
}

function showDocModal() {
  openModal({
    title: '上传文档',
    wide: true,
    body: `
      <div class="field"><label>文档标题</label><input id="doc-title" placeholder="例如：售后服务规范"></div>
      <div class="field"><label>内容</label><textarea id="doc-content" style="min-height:220px" placeholder="粘贴文档正文，支持换行和段落"></textarea></div>
      <div class="field"><label>分块大小（字符）</label><input id="doc-size" type="number" value="180" min="80" max="600"></div>
      <div class="helper">平台会自动按句子和段落切分内容，并为每个分块生成引用编号。</div>`,
    actions: `<button class="btn" data-close>取消</button><button class="btn primary" id="confirm-doc">${icon('check')}保存文档</button>`,
  })
  $('#confirm-doc').addEventListener('click', () => {
    const title = $('#doc-title').value.trim() || '未命名文档'
    const content = $('#doc-content').value.trim()
    const chunkSize = Number($('#doc-size').value) || 180
    if (!content) {
      toast('请填写文档内容', 'err')
      return
    }
    state.docs.unshift({ id: uid('doc'), title, content, chunkSize, createdAt: Date.now() })
    persistState()
    closeModal()
    toast(`已保存《${title}》`)
    renderKnowledge($('#view'))
  })
}

function showDocDetail(docId) {
  const doc = state.docs.find((item) => item.id === docId)
  if (!doc) return
  const chunks = chunkDocument(doc)
  openModal({
    title: doc.title,
    wide: true,
    body: `
      <div class="helper">${chunks.length} 个分块 · 分块大小 ${doc.chunkSize || 180} 字符</div>
      <div class="chunk-list">
        ${chunks.map((chunk) => `<div class="chunk"><div class="cid">${escapeHtml(chunk.id)}</div>${escapeHtml(chunk.text)}</div>`).join('')}
      </div>`,
    actions: `<button class="btn" data-close>关闭</button>`,
  })
}

function runHitTest() {
  const query = $('#hit-query').value.trim()
  if (!query) return
  const chunks = []
  for (const doc of state.docs) {
    for (const chunk of chunkDocument(doc)) chunks.push({ ...chunk, docTitle: doc.title })
  }
  const terms = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1)
  const ranked = chunks
    .map((chunk) => {
      let score = 0
      const haystack = chunk.text.toLowerCase()
      for (const term of terms) if (haystack.includes(term)) score += 1 + term.length / 4
      let highlighted = chunk.text
      for (const term of terms) {
        highlighted = highlighted.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>')
      }
      return { ...chunk, score, highlighted }
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
  $('#hit-results').innerHTML = ranked.length
    ? ranked.map((chunk) => `<div class="chunk"><div class="cid">${escapeHtml(chunk.id)} · ${escapeHtml(chunk.docTitle)} · 得分 ${chunk.score.toFixed(1)}</div>${chunk.highlighted}</div>`).join('')
    : '<div class="empty">未命中任何分块</div>'
}

/* ---------------- Observability & replay ---------------- */

function renderObservability(root) {
  const runs = [...state.runs].sort((a, b) => b.startedAt - a.startedAt)
  updateTopbar({
    title: '可观测性',
    crumb: '监控 / 运行记录',
    hint: '点击任意运行，回放每一步决策',
    actions: '',
  })
  if (state.activeRunId && !appViewById()) {
    renderRunDetail(root)
    return
  }
  root.innerHTML = `
    <div class="stats-row" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="stat"><div class="stat-label">${icon('activity')}总运行</div><div class="stat-value">${state.runs.length}</div></div>
      <div class="stat"><div class="stat-label">${icon('clock')}平均耗时</div><div class="stat-value">${state.runs.length ? Math.round(state.runs.reduce((sum, run) => sum + run.totalDuration, 0) / state.runs.length) : 0}<small style="font-size:13px">ms</small></div></div>
      <div class="stat"><div class="stat-label">${icon('sparkles')}Token</div><div class="stat-value">${formatNumber(state.runs.reduce((sum, run) => sum + (run.totalTokens || 0), 0))}</div></div>
    </div>
    <div class="card card-pad" style="margin-bottom:16px">
      <div class="section-title">${icon('activity')}Token 趋势</div>
      ${analyticsChart(runs.slice(0, 8).reverse())}
    </div>
    <div class="card">
      <table class="table">
        <thead><tr><th>应用</th><th>输入</th><th>状态</th><th>耗时</th><th>Token</th><th>时间</th><th></th></tr></thead>
        <tbody>
          ${runs.map((run) => `<tr>
            <td><strong>${escapeHtml(run.appName)}</strong></td>
            <td class="muted" style="max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escapeHtml(JSON.stringify(run.inputs || {}))}</td>
            <td><span class="tag teal">${icon('check', 12)}成功</span></td>
            <td class="mono">${run.totalDuration || 0}ms</td>
            <td class="mono">${formatNumber(run.totalTokens || 0)}</td>
            <td class="muted">${formatTime(run.startedAt)}</td>
            <td><button class="icon-btn sm" title="回放" data-action="view-run" data-run="${run.id}">${icon('play')}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`
}

function appViewById() {
  return false
}

function analyticsChart(runs) {
  if (!runs.length) return '<div class="empty">还没有可绘制的运行数据</div>'
  const max = Math.max(...runs.map((run) => run.totalTokens || 0), 1)
  const width = 720
  const height = 150
  const gap = 14
  const barWidth = Math.max(18, (width - gap * (runs.length - 1)) / runs.length)
  const bars = runs.map((run, index) => {
    const h = Math.max(4, Math.round((run.totalTokens || 0) / max * (height - 40)))
    const x = index * (barWidth + gap)
    const y = height - h - 22
    return `<g>
      <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3" fill="#0e7d72" opacity="0.88"></rect>
      <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="10" fill="#6b7280">${run.totalTokens || 0}</text>
    </g>`
  }).join('')
  return `<div style="overflow:auto"><svg viewBox="0 0 ${width} ${height}" style="width:100%; max-width:760px; height:150px" role="img" aria-label="Token 趋势">
    <line x1="0" y1="${height - 22}" x2="${width}" y2="${height - 22}" stroke="#e4e7ec" stroke-width="1"></line>
    ${bars}
  </svg></div>`
}

function renderRunDetail(root) {
  const run = state.runs.find((item) => item.id === state.activeRunId)
  if (!run) {
    state.activeRunId = null
    renderObservability(root)
    return
  }
  const steps = run.steps || []
  state.replay.index = Math.min(state.replay.index, Math.max(0, steps.length - 1))
  const current = steps[state.replay.index]
  updateTopbar({
    title: '运行回放',
    crumb: `可观测性 / ${run.appName}`,
    hint: `共 ${steps.length} 步`,
    actions: `<button class="btn" data-action="back-runs">${icon('chevron-right', 14).replace('m9 18', 'm15 18').replace('6-6-6-6', '6-6 6 6')}返回列表</button>`,
  })
  root.innerHTML = `
    <div class="replay-shell">
      <section>
        <div class="card card-pad" style="margin-bottom:16px">
          <div class="section-title" style="margin-bottom:8px">${icon('play')}Run Replay 时间旅行</div>
          <div class="helper" style="margin-bottom:12px">运行于 ${formatTime(run.startedAt)} · 总耗时 ${run.totalDuration}ms · ${run.totalTokens} tokens · $${(run.totalCost || 0).toFixed(4)}</div>
          <div class="timeline">
            <button class="icon-btn" data-action="replay-prev" title="上一步">${icon('undo')}</button>
            <div class="track" data-count="${steps.length}">
              <div class="fill" style="width:${steps.length ? (state.replay.index + 1) / steps.length * 100 : 0}%"></div>
              <span class="thumb" style="left:${steps.length ? (state.replay.index + 1) / steps.length * 100 : 0}%"></span>
            </div>
            <button class="icon-btn primary" data-action="replay-toggle" title="播放 / 暂停">${state.replay.playing ? icon('pause') : icon('play')}</button>
            <button class="icon-btn" data-action="replay-next" title="下一步">${icon('redo')}</button>
          </div>
        </div>
        <div class="section-title">${icon('activity')}步骤</div>
        ${steps.map((step, index) => `<div class="step-row ${index === state.replay.index ? 'active' : ''}">
          <span class="step-idx">${index + 1}</span>
          <div class="step-main">
            <div class="step-title">${escapeHtml(step.name)}</div>
            <div class="step-meta">${step.meta?.durationMs || 0}ms · ${step.meta?.tokens || 0} tokens · $${(step.meta?.cost || 0).toFixed(4)}</div>
            <div class="step-out">${escapeHtml(previewOutput(step))}</div>
          </div>
        </div>`).join('')}
      </section>
      <section>
        <div class="card card-pad">
          <div class="section-title">${icon('code')}节点输出</div>
          <div class="helper" style="margin-bottom:8px">${current ? `${current.name} · 输入与输出` : '拖动时间轴查看'}</div>
          <div class="json-block">${current ? escapeHtml(JSON.stringify(current.output, null, 2)) : '{}'}</div>
          <div class="divider" style="margin:14px 0"></div>
          <div class="section-title">${icon('api')}运行输入</div>
          <div class="json-block">${escapeHtml(JSON.stringify(run.inputs || {}, null, 2))}</div>
        </div>
      </section>
    </div>`
}

function replayTo(index) {
  const run = state.runs.find((item) => item.id === state.activeRunId)
  if (!run) return
  const max = Math.max(0, (run.steps || []).length - 1)
  state.replay.index = Math.min(max, Math.max(0, index))
  renderObservability($('#view'))
}

function toggleReplay() {
  const run = state.runs.find((item) => item.id === state.activeRunId)
  if (!run) return
  const max = Math.max(0, (run.steps || []).length - 1)
  if (state.replay.playing) {
    clearInterval(state.replay.timer)
    state.replay.timer = null
    state.replay.playing = false
    renderObservability($('#view'))
    return
  }
  state.replay.playing = true
  state.replay.timer = setInterval(() => {
    if (state.replay.index >= max) {
      clearInterval(state.replay.timer)
      state.replay.timer = null
      state.replay.playing = false
      renderObservability($('#view'))
      return
    }
    state.replay.index += 1
    renderObservability($('#view'))
  }, 900)
  renderObservability($('#view'))
}

/* ---------------- Settings ---------------- */

function renderSettings(root) {
  const s = state.settings
  updateTopbar({
    title: '设置',
    crumb: '工作空间 / 设置',
    hint: '模型供应商与运行模式',
    actions: `<button class="btn primary" data-action="settings-save">${icon('save')}保存设置</button>`,
  })
  root.innerHTML = `
    <div class="settings-grid">
      <div class="card card-pad">
        <div class="section-title">${icon('settings')}运行模式</div>
        <div class="setting-row">
          <div><strong>演示模式</strong><div class="helper">使用本地模拟引擎，无需 API Key 即可体验完整流程。</div></div>
          <button class="toggle ${s.demo ? 'on' : ''}" data-action="toggle-demo" title="切换演示模式"></button>
        </div>
        <div class="setting-row">
          <div><strong>真实模型</strong><div class="helper">关闭演示模式后，LLM 节点调用 OpenAI 兼容接口。</div></div>
          <span class="tag ${s.demo ? '' : 'teal'}">${s.demo ? '未启用' : '已启用'}</span>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-title">${icon('api')}OpenAI 兼容接口</div>
        <div class="field" style="margin-bottom:12px"><label>Base URL</label><input id="set-base" placeholder="https://api.openai.com/v1" value="${escapeHtml(s.baseUrl)}"></div>
        <div class="field" style="margin-bottom:12px"><label>API Key</label><input id="set-key" type="password" placeholder="sk-..." value="${escapeHtml(s.apiKey)}"></div>
        <div class="field-row">
          <div class="field"><label>模型</label><input id="set-model" value="${escapeHtml(s.model)}"></div>
          <div class="field"><label>温度</label><input id="set-temp" type="number" min="0" max="2" step="0.1" value="${s.temperature ?? 0.7}"></div>
        </div>
        <div class="helper" style="margin-top:10px">API Key 仅保存在本机浏览器 localStorage 中，不会上传。</div>
      </div>
    </div>
    <div class="card card-pad" style="margin-top:16px; max-width:980px">
      <div class="section-title">${icon('api')}后端即服务</div>
      <div class="helper">工作流通过以下接口执行，可直接接入自己的业务逻辑：</div>
      <div class="json-block" style="margin-top:10px">POST /api/run\nContent-Type: application/json\n\n{\n  "workflow": { "nodes": [], "edges": [] },\n  "inputs": { "query": "如何退款" },\n  "settings": { "demo": true },\n  "knowledge": []\n}</div>
      <button class="btn" style="margin-top:10px" data-action="copy-api">${icon('copy')}复制请求示例</button>
    </div>`
}

/* ---------------- Global events & init ---------------- */

function bindGlobalEvents() {
  document.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]')
    if (!actionEl) return
    const action = actionEl.dataset.action

    if (action === 'new-app') showNewAppModal()
    if (action === 'open-flow') {
      const appId = actionEl.dataset.app
      const flow = flowForApp(appId)
      if (flow) {
        state.activeFlowId = flow.id
        go('workflow')
      }
    }
    if (action === 'quick-run') {
      const appId = actionEl.dataset.app
      const flow = flowForApp(appId)
      if (flow) {
        state.activeFlowId = flow.id
        go('workflow')
        setTimeout(() => {
          studio.runOpen = true
          renderInspector()
        }, 0)
      }
    }
    if (action === 'delete-app') {
      const appId = actionEl.dataset.app
      const app = appById(appId)
      if (app && confirm(`确定删除「${app.name}」及其工作流吗？`)) {
        state.apps = state.apps.filter((item) => item.id !== appId)
        for (const [id, flow] of Object.entries(state.workflows)) {
          if (flow.appId === appId) delete state.workflows[id]
        }
        persistState()
        render()
      }
    }

    if (action === 'flow-back') {
      state.selectedNodeId = null
      studio.runOpen = false
      go('dashboard')
    }
    if (action === 'save-flow') {
      persistWorkflow()
      toast('工作流已保存')
    }
    if (action === 'undo') undo()
    if (action === 'redo') redo()
    if (action === 'auto-layout') autoLayout()
    if (action === 'zoom-in') setZoom(studio.zoom + 0.1)
    if (action === 'zoom-out') setZoom(studio.zoom - 0.1)
    if (action === 'zoom-reset') setZoom(1)
    if (action === 'run-flow') {
      studio.runOpen = true
      studio.selectedNodeId = null
      renderInspector()
    }

    if (action === 'lab-run') runLab()
    if (action === 'lab-reset') {
      lab.variantA = '你是客服助手，请友好地回答问题：\n\n{{query}}'
      lab.variantB = '你是一位严谨的专家。先分析，再分点回答：\n\n{{query}}'
      lab.results = null
      renderLab($('#view'))
    }
    if (action === 'lab-add-case') {
      const name = prompt('用例名称')
      if (!name) return
      const input = prompt('用例输入') || ''
      lab.cases.push({ id: uid('case'), name, input })
      renderLab($('#view'))
    }
    if (action === 'lab-del-case') {
      lab.cases = lab.cases.filter((item) => item.id !== actionEl.dataset.case)
      renderLab($('#view'))
    }

    if (action === 'doc-add') showDocModal()
    if (action === 'doc-view') showDocDetail(actionEl.dataset.doc)
    if (action === 'doc-delete') {
      const doc = state.docs.find((item) => item.id === actionEl.dataset.doc)
      if (doc && confirm(`确定删除《${doc.title}》吗？`)) {
        state.docs = state.docs.filter((item) => item.id !== actionEl.dataset.doc)
        persistState()
        renderKnowledge($('#view'))
      }
    }
    if (action === 'hit-test') runHitTest()

    if (action === 'view-run') {
      state.activeRunId = actionEl.dataset.run
      state.replay.index = 0
      state.replay.playing = false
      if (state.replay.timer) {
        clearInterval(state.replay.timer)
        state.replay.timer = null
      }
      go('observability')
    }
    if (action === 'back-runs') {
      state.activeRunId = null
      state.replay.playing = false
      renderObservability($('#view'))
    }
    if (action === 'replay-prev') replayTo(state.replay.index - 1)
    if (action === 'replay-next') replayTo(state.replay.index + 1)
    if (action === 'replay-toggle') toggleReplay()

    if (action === 'toggle-demo') {
      state.settings.demo = !state.settings.demo
      persistState()
      renderSettings($('#view'))
    }
    if (action === 'settings-save') {
      state.settings.baseUrl = $('#set-base').value.trim()
      state.settings.apiKey = $('#set-key').value.trim()
      state.settings.model = $('#set-model').value.trim() || 'gpt-4o-mini'
      state.settings.temperature = Number($('#set-temp').value) || 0.7
      persistState()
      toast('设置已保存')
    }
    if (action === 'copy-api') {
      const text = `POST /api/run\nContent-Type: application/json\n\n{\n  "workflow": { "nodes": [], "edges": [] },\n  "inputs": { "query": "如何退款" },\n  "settings": { "demo": true },\n  "knowledge": []\n}`
      navigator.clipboard?.writeText(text).then(() => toast('已复制'))
    }
  })

  document.addEventListener('input', (event) => {
    if (event.target.id === 'variant-a') lab.variantA = event.target.value
    if (event.target.id === 'variant-b') lab.variantB = event.target.value
  })

  document.addEventListener('click', (event) => {
    const track = event.target.closest('.timeline .track')
    if (track) {
      const count = Number(track.dataset.count) || 1
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      replayTo(Math.round((count - 1) * ratio))
      return
    }
    const row = event.target.closest('[data-run]')
    if (row && !event.target.closest('[data-action]')) {
      state.activeRunId = row.dataset.run
      state.replay.index = 0
      go('observability')
    }
  })
}

function init() {
  hydrateStaticIcons()
  loadState()
  setupNavigation()
  bindGlobalEvents()
  render()
}

init()
