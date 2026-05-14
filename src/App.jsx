import { useEffect, useState } from 'react'

const defaultLinks = [
  { name: 'OpenES', url: 'https://open-es.com/' },
  { name: 'マイナビ', url: 'https://job.mynavi.jp/' },
  { name: 'リクナビ', url: 'https://job.rikunabi.com/' },
]

const STATUSES = ['候補', 'ES', 'SPI', '一次面接', '最終面接', '内定', '見送り']
const STATUS_COLOR = {
  '候補':    { bg: '#e2e8f0', text: '#475569' },
  'ES':      { bg: '#dbeafe', text: '#1d4ed8' },
  'SPI':     { bg: '#fef3c7', text: '#92400e' },
  '一次面接': { bg: '#ede9fe', text: '#6d28d9' },
  '最終面接': { bg: '#e0e7ff', text: '#4338ca' },
  '内定':    { bg: '#dcfce7', text: '#15803d' },
  '見送り':  { bg: '#fee2e2', text: '#b91c1c' },
}

const CATEGORIES = ['自己PR', '志望動機', 'ガクチカ', 'その他']
const CATEGORY_COLOR = {
  '自己PR':   { bg: '#dbeafe', text: '#1d4ed8' },
  '志望動機': { bg: '#dcfce7', text: '#15803d' },
  'ガクチカ': { bg: '#fef9c3', text: '#854d0e' },
  'その他':   { bg: '#f1f5f9', text: '#475569' },
}

const defaultTemplates = [
  { id: crypto.randomUUID(), title: 'ガクチカ（例）', category: 'ガクチカ', content: '学生時代に力を入れたことを記入してください。' },
  { id: crypto.randomUUID(), title: '志望動機（例）', category: '志望動機', content: 'なぜその企業を志望するかを記入してください。' },
]

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) }
  catch { return fallback }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')
  const [companies, setCompanies] = useState(load('companies', []))
  const [templates, setTemplates] = useState(() => {
    const saved = load('templates', null)
    if (!saved) return defaultTemplates
    return saved.map((t) => ({
      id: t.id || crypto.randomUUID(),
      category: t.category || 'その他',
      title: t.title,
      content: t.content,
    }))
  })
  const [links] = useState(load('links', defaultLinks))
  const [globalMemo, setGlobalMemo] = useState(localStorage.getItem('memo') || '')

  const [selectedId, setSelectedId] = useState(null)
  const [companyInput, setCompanyInput] = useState('')
  const [taskInput, setTaskInput] = useState('')

  const [activeTab, setActiveTab] = useState(null)
  const [filterCat, setFilterCat] = useState('すべて')
  const [tplTitle, setTplTitle] = useState('')
  const [tplCategory, setTplCategory] = useState('自己PR')
  const [tplContent, setTplContent] = useState('')
  const [editingTplId, setEditingTplId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : ''
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])
  useEffect(() => localStorage.setItem('companies', JSON.stringify(companies)), [companies])
  useEffect(() => localStorage.setItem('templates', JSON.stringify(templates)), [templates])
  useEffect(() => localStorage.setItem('memo', globalMemo), [globalMemo])

  const selected = companies.find((c) => c.id === selectedId) ?? null

  const addCompany = () => {
    const name = companyInput.trim()
    if (!name) return
    const company = { id: crypto.randomUUID(), name, status: '候補', note: '', tasks: [] }
    setCompanies((prev) => [...prev, company])
    setSelectedId(company.id)
    setCompanyInput('')
  }

  const updateSelected = (patch) => {
    if (!selected) return
    setCompanies((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...patch } : c)))
  }

  const deleteSelected = () => {
    if (!selected) return
    const next = companies.filter((c) => c.id !== selected.id)
    setCompanies(next)
    setSelectedId(next[0]?.id ?? null)
  }

  const addTask = () => {
    const text = taskInput.trim()
    if (!text || !selected) return
    updateSelected({ tasks: [...(selected.tasks || []), { id: crypto.randomUUID(), text, done: false }] })
    setTaskInput('')
  }

  const toggleTask = (id) => {
    if (!selected) return
    updateSelected({ tasks: selected.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })
  }

  const deleteTask = (id) => {
    if (!selected) return
    updateSelected({ tasks: selected.tasks.filter((t) => t.id !== id) })
  }

  // テンプレート操作
  const saveTemplate = () => {
    if (!tplTitle.trim() || !tplContent.trim()) return
    if (editingTplId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTplId
            ? { ...t, title: tplTitle.trim(), category: tplCategory, content: tplContent.trim() }
            : t
        )
      )
      setEditingTplId(null)
    } else {
      setTemplates((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title: tplTitle.trim(), category: tplCategory, content: tplContent.trim() },
      ])
    }
    setTplTitle('')
    setTplContent('')
    setTplCategory('自己PR')
  }

  const startEditTemplate = (t) => {
    setEditingTplId(t.id)
    setTplTitle(t.title)
    setTplCategory(t.category)
    setTplContent(t.content)
    setActiveTab('定型文')
  }

  const cancelEditTemplate = () => {
    setEditingTplId(null)
    setTplTitle('')
    setTplContent('')
    setTplCategory('自己PR')
  }

  const copyTemplate = (t) => {
    navigator.clipboard.writeText(t.content).then(() => {
      setCopiedId(t.id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  const filteredTemplates = filterCat === 'すべて' ? templates : templates.filter((t) => t.category === filterCat)

  const toggleTab = (tab) => setActiveTab((prev) => (prev === tab ? null : tab))

  return (
    <div className="appShell">
      {/* ヘッダー */}
      <header className="header">
        <h1 className="headerTitle">就活Hub</h1>
        <div className="headerRight">
          <span className="companyStat">{companies.length} 社管理中</span>
          <button className="iconBtn" onClick={() => setDarkMode((v) => !v)} title="テーマ切替">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* メインワークスペース */}
      <div className="workspace">
        {/* 左サイドバー：会社一覧 */}
        <aside className="sidebar">
          <div className="sidebarAdd">
            <input
              className="sidebarInput"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCompany()}
              placeholder="会社名を入力して Enter"
            />
            <button className="btnPrimary sidebarAddBtn" onClick={addCompany}>＋</button>
          </div>

          {companies.length === 0 ? (
            <p className="sidebarEmpty">会社を追加してください</p>
          ) : (
            <ul className="companyList">
              {companies.map((c) => (
                <li
                  key={c.id}
                  className={`companyItem ${c.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span className="companyItemName">{c.name}</span>
                  <span
                    className="statusChip"
                    style={{ background: STATUS_COLOR[c.status]?.bg, color: STATUS_COLOR[c.status]?.text }}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* 右：会社詳細 */}
        <main className="detailPanel">
          {!selected ? (
            <div className="detailEmpty">
              <p>左の一覧から会社を選択するか、</p>
              <p>新しい会社を追加してください。</p>
            </div>
          ) : (
            <>
              <div className="detailHeader">
                <h2 className="detailCompanyName">{selected.name}</h2>
                <button className="btnDanger btnSm" onClick={deleteSelected}>削除</button>
              </div>

              {/* ステータス */}
              <div className="detailSection">
                <label className="sectionLabel">選考ステータス</label>
                <div className="statusSelector">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`statusOption ${selected.status === s ? 'selected' : ''}`}
                      style={
                        selected.status === s
                          ? { background: STATUS_COLOR[s]?.bg, color: STATUS_COLOR[s]?.text, borderColor: STATUS_COLOR[s]?.text }
                          : {}
                      }
                      onClick={() => updateSelected({ status: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* メモ */}
              <div className="detailSection">
                <label className="sectionLabel">メモ</label>
                <textarea
                  className="detailTextarea"
                  value={selected.note || ''}
                  onChange={(e) => updateSelected({ note: e.target.value })}
                  placeholder="面接日程、担当者名、気になった点など..."
                />
              </div>

              {/* タスク */}
              <div className="detailSection">
                <label className="sectionLabel">タスク</label>
                <ul className="taskList">
                  {(selected.tasks || []).map((task) => (
                    <li key={task.id} className="taskItem">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="taskCheck"
                      />
                      <span className={task.done ? 'taskText done' : 'taskText'}>{task.text}</span>
                      <button className="taskDelete" onClick={() => deleteTask(task.id)} title="削除">×</button>
                    </li>
                  ))}
                </ul>
                <div className="taskAdd">
                  <input
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="やることを入力して Enter"
                    className="taskInput"
                  />
                  <button className="btnPrimary btnSm" onClick={addTask}>追加</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* 下部パネル：タブ式 */}
      <div className="bottomPanel">
        <div className="tabBar">
          {['定型文', 'メモ', 'リンク'].map((tab) => (
            <button
              key={tab}
              className={`tabBtn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => toggleTab(tab)}
            >
              {tab}
              <span className="tabArrow">{activeTab === tab ? '▼' : '▲'}</span>
            </button>
          ))}
        </div>

        {activeTab && (
          <div className="tabContent">
            {/* 定型文タブ */}
            {activeTab === '定型文' && (
              <div className="templatePanel">
                <div className="templateForm">
                  <div className="templateFormRow">
                    <input
                      value={tplTitle}
                      onChange={(e) => setTplTitle(e.target.value)}
                      placeholder="タイトル（例：IT職向け自己PR）"
                      className="tplTitleInput"
                    />
                    <select value={tplCategory} onChange={(e) => setTplCategory(e.target.value)} className="tplCatSelect">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <textarea
                    value={tplContent}
                    onChange={(e) => setTplContent(e.target.value)}
                    placeholder="定型文の内容..."
                    className="tplTextarea"
                  />
                  <div className="templateFormActions">
                    <button className="btnPrimary btnSm" onClick={saveTemplate}>{editingTplId ? '更新' : '追加'}</button>
                    {editingTplId && (
                      <button className="btnSecondary btnSm" onClick={cancelEditTemplate}>キャンセル</button>
                    )}
                  </div>
                </div>

                <div className="tplFilter">
                  {['すべて', ...CATEGORIES].map((c) => (
                    <button
                      key={c}
                      className={`filterChip ${filterCat === c ? 'active' : ''}`}
                      onClick={() => setFilterCat(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="tplList">
                  {filteredTemplates.length === 0 && <p className="emptyNote">定型文がありません。</p>}
                  {filteredTemplates.map((t) => (
                    <div key={t.id} className={`tplCard ${editingTplId === t.id ? 'editing' : ''}`}>
                      <div className="tplCardHead">
                        <span
                          className="catBadge"
                          style={{ background: CATEGORY_COLOR[t.category]?.bg, color: CATEGORY_COLOR[t.category]?.text }}
                        >
                          {t.category}
                        </span>
                        <strong className="tplCardTitle">{t.title}</strong>
                      </div>
                      <p className="tplCardBody">{t.content}</p>
                      <div className="tplCardActions">
                        <button
                          className={`btnCopy btnSm ${copiedId === t.id ? 'copied' : ''}`}
                          onClick={() => copyTemplate(t)}
                        >
                          {copiedId === t.id ? 'コピー済 ✓' : 'コピー'}
                        </button>
                        <button className="btnSecondary btnSm" onClick={() => startEditTemplate(t)}>編集</button>
                        <button
                          className="btnDanger btnSm"
                          onClick={() => {
                            setTemplates((prev) => prev.filter((x) => x.id !== t.id))
                            if (editingTplId === t.id) cancelEditTemplate()
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* メモタブ */}
            {activeTab === 'メモ' && (
              <textarea
                className="memoTextarea"
                value={globalMemo}
                onChange={(e) => setGlobalMemo(e.target.value)}
                placeholder="全体的なメモ・備忘録..."
              />
            )}

            {/* リンクタブ */}
            {activeTab === 'リンク' && (
              <div className="linkGrid">
                {links.map((l) => (
                  <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="linkCard">
                    {l.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
