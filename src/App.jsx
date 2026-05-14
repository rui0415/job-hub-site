import { useEffect, useMemo, useState } from 'react'

const defaultLinks = [
  { name: 'OpenES', url: 'https://open-es.com/' },
  { name: 'マイナビ', url: 'https://job.mynavi.jp/' },
  { name: 'リクナビ', url: 'https://job.rikunabi.com/' }
]

const statuses = ['候補', 'ES', 'SPI', '一次面接', '最終面接', '内定', '見送り']
const categories = ['自己PR', '志望動機', 'ガクチカ', 'その他']

const defaultTemplates = [
  { id: crypto.randomUUID(), title: 'ガクチカ', category: 'ガクチカ', content: '学生時代に力を入れたことを記入' },
  { id: crypto.randomUUID(), title: '志望動機', category: '志望動機', content: 'なぜその企業を志望するかを記入' }
]

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')
  const [companies, setCompanies] = useState(load('companies', []))
  const [templates, setTemplates] = useState(() => {
    const saved = load('templates', null)
    if (!saved) return defaultTemplates
    // 既存データに id・category がなければ補完
    return saved.map((t) => ({
      id: t.id || crypto.randomUUID(),
      category: t.category || 'その他',
      title: t.title,
      content: t.content
    }))
  })
  const [links] = useState(load('links', defaultLinks))
  const [globalMemo, setGlobalMemo] = useState(localStorage.getItem('memo') || '')

  const [companyName, setCompanyName] = useState('')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateContent, setTemplateContent] = useState('')
  const [templateCategory, setTemplateCategory] = useState('自己PR')
  const [editingId, setEditingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('すべて')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quickTask, setQuickTask] = useState('')

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : ''
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => localStorage.setItem('companies', JSON.stringify(companies)), [companies])
  useEffect(() => localStorage.setItem('templates', JSON.stringify(templates)), [templates])
  useEffect(() => localStorage.setItem('memo', globalMemo), [globalMemo])

  useEffect(() => {
    if (currentIndex > companies.length - 1) {
      setCurrentIndex(Math.max(0, companies.length - 1))
    }
  }, [companies.length, currentIndex])

  const currentCompany = companies[currentIndex]

  const progressLabel = useMemo(() => {
    if (!currentCompany) return '0 / 0'
    return `${currentIndex + 1} / ${companies.length}`
  }, [companies.length, currentCompany, currentIndex])

  const addCompany = () => {
    const name = companyName.trim()
    if (!name) return
    setCompanies((prev) => [...prev, { id: crypto.randomUUID(), name, status: '候補', note: '', tasks: [] }])
    setCompanyName('')
    setCurrentIndex(companies.length)
    setFlipped(false)
  }

  const updateCurrent = (patch) => {
    if (!currentCompany) return
    setCompanies((prev) =>
      prev.map((c) => (c.id === currentCompany.id ? { ...c, ...patch } : c))
    )
  }

  const addQuickTask = () => {
    const text = quickTask.trim()
    if (!text || !currentCompany) return
    updateCurrent({ tasks: [...(currentCompany.tasks || []), { id: crypto.randomUUID(), text, done: false }] })
    setQuickTask('')
  }

  const toggleTask = (taskId) => {
    if (!currentCompany) return
    updateCurrent({
      tasks: (currentCompany.tasks || []).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    })
  }

  const removeCurrent = () => {
    if (!currentCompany) return
    setCompanies((prev) => prev.filter((c) => c.id !== currentCompany.id))
    setFlipped(false)
  }

  // テンプレート操作
  const saveTemplate = () => {
    if (!templateTitle.trim() || !templateContent.trim()) return
    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, title: templateTitle.trim(), category: templateCategory, content: templateContent.trim() }
            : t
        )
      )
      setEditingId(null)
    } else {
      setTemplates((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title: templateTitle.trim(), category: templateCategory, content: templateContent.trim() }
      ])
    }
    setTemplateTitle('')
    setTemplateContent('')
    setTemplateCategory('自己PR')
  }

  const startEdit = (t) => {
    setEditingId(t.id)
    setTemplateTitle(t.title)
    setTemplateCategory(t.category)
    setTemplateContent(t.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTemplateTitle('')
    setTemplateContent('')
    setTemplateCategory('自己PR')
  }

  const removeTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) cancelEdit()
  }

  const copyTemplate = (t) => {
    navigator.clipboard.writeText(t.content).then(() => {
      setCopiedId(t.id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  const filteredTemplates = filterCategory === 'すべて'
    ? templates
    : templates.filter((t) => t.category === filterCategory)

  return (
    <div className="appShell">
      <header className="topBar">
        <h1>就活Hub Flashcards</h1>
        <div className="topBarControls">
          <span>{progressLabel}</span>
          <button onClick={() => setDarkMode((v) => !v)}>{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <section className="addRow">
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="会社名を追加" onKeyDown={(e) => e.key === 'Enter' && addCompany()} />
        <button onClick={addCompany}>追加</button>
      </section>

      <main className="mainCardArea">
        {!currentCompany ? (
          <div className="emptyState">会社を追加するとここに1社ずつ表示されます。</div>
        ) : (
          <article className={`flashcard ${flipped ? 'flipped' : ''}`}>
            <div className="face front">
              <h2>{currentCompany.name}</h2>
              <label>選考ステータス</label>
              <select value={currentCompany.status} onChange={(e) => updateCurrent({ status: e.target.value })}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="navRow">
                <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}>← 前へ</button>
                <button onClick={() => setFlipped(true)}>詳細を見る</button>
                <button onClick={() => setCurrentIndex((i) => Math.min(companies.length - 1, i + 1))}>次へ →</button>
              </div>
            </div>

            <div className="face back">
              <h3>{currentCompany.name} の詳細</h3>
              <textarea
                value={currentCompany.note || ''}
                onChange={(e) => updateCurrent({ note: e.target.value })}
                placeholder="企業ごとのメモ"
              />
              <div className="taskComposer">
                <input value={quickTask} onChange={(e) => setQuickTask(e.target.value)} placeholder="やること" onKeyDown={(e) => e.key === 'Enter' && addQuickTask()} />
                <button onClick={addQuickTask}>追加</button>
              </div>
              <ul className="taskList">
                {(currentCompany.tasks || []).map((task) => (
                  <li key={task.id}>
                    <label>
                      <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                      <span className={task.done ? 'done' : ''}>{task.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="navRow">
                <button onClick={() => setFlipped(false)}>← 表面へ</button>
                <button className="danger" onClick={removeCurrent}>この会社を削除</button>
              </div>
            </div>
          </article>
        )}
      </main>

      <section className="dock">
        <details>
          <summary>定型文管理</summary>
          <div className="templateManager">
            {/* 入力フォーム */}
            <div className="templateForm">
              <div className="templateFormRow">
                <input
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="タイトル（例：IT職向け自己PR）"
                  className="templateTitleInput"
                />
                <select value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="定型文の内容を入力..."
                className="templateTextarea"
              />
              <div className="templateFormActions">
                <button onClick={saveTemplate}>{editingId ? '更新' : '追加'}</button>
                {editingId && <button className="btnSecondary" onClick={cancelEdit}>キャンセル</button>}
              </div>
            </div>

            {/* フィルター */}
            <div className="templateFilter">
              {['すべて', ...categories].map((c) => (
                <button
                  key={c}
                  className={`filterChip ${filterCategory === c ? 'active' : ''}`}
                  onClick={() => setFilterCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* テンプレート一覧 */}
            <div className="templateList">
              {filteredTemplates.length === 0 && (
                <p className="emptyState">定型文がありません。</p>
              )}
              {filteredTemplates.map((t) => (
                <div key={t.id} className={`templateCard ${editingId === t.id ? 'editing' : ''}`}>
                  <div className="templateCardHeader">
                    <span className="categoryBadge" data-cat={t.category}>{t.category}</span>
                    <strong className="templateCardTitle">{t.title}</strong>
                  </div>
                  <p className="templateCardBody">{t.content}</p>
                  <div className="templateCardActions">
                    <button className={`btnCopy ${copiedId === t.id ? 'copied' : ''}`} onClick={() => copyTemplate(t)}>
                      {copiedId === t.id ? 'コピー済み ✓' : 'コピー'}
                    </button>
                    <button className="btnSecondary" onClick={() => startEdit(t)}>編集</button>
                    <button className="danger" onClick={() => removeTemplate(t.id)}>削除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>

        <details>
          <summary>共通メモ</summary>
          <textarea value={globalMemo} onChange={(e) => setGlobalMemo(e.target.value)} placeholder="全体メモ" />
        </details>

        <details>
          <summary>リンク</summary>
          <div className="linkRow">{links.map((l) => <a key={l.name} href={l.url} target="_blank" rel="noreferrer">{l.name}</a>)}</div>
        </details>
      </section>
    </div>
  )
}
