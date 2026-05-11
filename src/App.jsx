import { useEffect, useMemo, useState } from 'react'

const defaultLinks = [
  { name: 'OpenES', url: 'https://open-es.com/' },
  { name: 'マイナビ', url: 'https://job.mynavi.jp/' },
  { name: 'リクナビ', url: 'https://job.rikunabi.com/' }
]

const statuses = ['候補', 'ES', 'SPI', '一次面接', '最終面接', '内定', '見送り']
const defaultTemplates = [
  { title: 'ガクチカ', content: '学生時代に力を入れたことを記入' },
  { title: '志望動機', content: 'なぜその企業を志望するかを記入' }
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
  const [templates, setTemplates] = useState(load('templates', defaultTemplates))
  const [links] = useState(load('links', defaultLinks))
  const [globalMemo, setGlobalMemo] = useState(localStorage.getItem('memo') || '')

  const [companyName, setCompanyName] = useState('')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateContent, setTemplateContent] = useState('')

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
    const newCompany = {
      id: crypto.randomUUID(),
      name,
      status: '候補',
      note: '',
      tasks: []
    }
    setCompanies((prev) => [...prev, newCompany])
    setCompanyName('')
    setCurrentIndex(companies.length)
    setFlipped(false)
  }

  const updateCurrent = (patch) => {
    if (!currentCompany) return
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === currentCompany.id ? { ...company, ...patch } : company
      )
    )
  }

  const addQuickTask = () => {
    const text = quickTask.trim()
    if (!text || !currentCompany) return
    updateCurrent({
      tasks: [...(currentCompany.tasks || []), { id: crypto.randomUUID(), text, done: false }]
    })
    setQuickTask('')
  }

  const toggleTask = (taskId) => {
    if (!currentCompany) return
    updateCurrent({
      tasks: (currentCompany.tasks || []).map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    })
  }

  const removeCurrent = () => {
    if (!currentCompany) return
    setCompanies((prev) => prev.filter((company) => company.id !== currentCompany.id))
    setFlipped(false)
  }

  const addTemplate = () => {
    if (!templateTitle.trim() || !templateContent.trim()) return
    setTemplates((prev) => [...prev, { title: templateTitle.trim(), content: templateContent.trim() }])
    setTemplateTitle('')
    setTemplateContent('')
  }

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
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="会社名を追加" />
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
                {statuses.map((status) => <option key={status}>{status}</option>)}
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
                <input value={quickTask} onChange={(e) => setQuickTask(e.target.value)} placeholder="やること" />
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
          <summary>ESテンプレ</summary>
          <input value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} placeholder="タイトル" />
          <textarea value={templateContent} onChange={(e) => setTemplateContent(e.target.value)} placeholder="内容" />
          <button onClick={addTemplate}>テンプレ追加</button>
          {templates.map((template, idx) => <p key={idx}><strong>{template.title}</strong>: {template.content}</p>)}
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
