import { useEffect, useState } from 'react'

const defaultLinks = [
  { name: 'OpenES', url: 'https://open-es.com/' },
  { name: 'マイナビ', url: 'https://job.mynavi.jp/' },
  { name: 'リクナビ', url: 'https://job.rikunabi.com/' }
]

const statuses = ['ES', 'SPI', '一次面接', '最終面接', '内定']

const defaultTemplates = [
  {
    title: 'ガクチカ',
    content: '学生時代に力を入れたことを記入'
  },
  {
    title: '志望動機',
    content: 'なぜその企業を志望するかを記入'
  }
]

export default function App() {
  const [memo, setMemo] = useState(localStorage.getItem('memo') || '')
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')
  const [companyName, setCompanyName] = useState('')
  const [dragIndex, setDragIndex] = useState(null)

  const [companies, setCompanies] = useState(
    JSON.parse(localStorage.getItem('companies') || '[]')
  )

  const [templates, setTemplates] = useState(
    JSON.parse(localStorage.getItem('templates') || JSON.stringify(defaultTemplates))
  )

  const [templateTitle, setTemplateTitle] = useState('')
  const [templateContent, setTemplateContent] = useState('')

  const [links] = useState(
    JSON.parse(localStorage.getItem('links') || JSON.stringify(defaultLinks))
  )

  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem('tasks') || '[]')
  )

  const [taskInput, setTaskInput] = useState('')

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : ''
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('memo', memo)
  }, [memo])

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies))
  }, [companies])

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates))
  }, [templates])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!taskInput.trim()) return
    setTasks([...tasks, { text: taskInput, done: false }])
    setTaskInput('')

    if (Notification.permission === 'granted') {
      new Notification('Todoを追加しました')
    }
  }

  const addCompany = () => {
    if (!companyName.trim()) return
    setCompanies([...companies, { name: companyName, status: 'ES' }])
    setCompanyName('')
  }

  const moveCompany = (idx, status) => {
    const updated = [...companies]
    updated[idx].status = status
    setCompanies(updated)
  }

  const addTemplate = () => {
    if (!templateTitle.trim() || !templateContent.trim()) return

    setTemplates([
      ...templates,
      {
        title: templateTitle,
        content: templateContent
      }
    ])

    setTemplateTitle('')
    setTemplateContent('')
  }

  const requestNotification = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission()
    }
  }

  return (
    <div className="container">
      <header className="headerRow">
        <div>
          <h1>就活Hub</h1>
          <p>就活用の自分専用ダッシュボード</p>
        </div>

        <div className="headerButtons">
          <button onClick={requestNotification}>通知ON</button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'ライトモード' : 'ダークモード'}
          </button>
        </div>
      </header>

      <section className="card">
        <h2>企業進捗Kanban</h2>

        <div className="taskInput">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="企業名を追加"
          />
          <button onClick={addCompany}>追加</button>
        </div>

        <div className="kanbanBoard">
          {statuses.map((status) => (
            <div
              key={status}
              className="kanbanColumn"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveCompany(dragIndex, status)}
            >
              <h3>{status}</h3>

              {companies
                .filter((company) => company.status === status)
                .map((company, idx) => (
                  <div
                    key={idx}
                    className="companyCard"
                    draggable
                    onDragStart={() => {
                      const originalIndex = companies.findIndex(
                        (c) => c.name === company.name
                      )
                      setDragIndex(originalIndex)
                    }}
                  >
                    {company.name}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>ESテンプレ管理</h2>

        <input
          value={templateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
          placeholder="テンプレタイトル"
        />

        <textarea
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
          placeholder="テンプレ内容"
        />

        <button onClick={addTemplate}>テンプレ追加</button>

        <div className="templateList">
          {templates.map((template, idx) => (
            <div key={idx} className="card">
              <h3>{template.title}</h3>
              <p>{template.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>マイページショートカット</h2>
        <div className="grid">
          {links.map((link, idx) => (
            <a key={idx} className="linkCard" href={link.url} target="_blank">
              {link.name}
            </a>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>メモ</h2>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="面接メモ、企業研究、ESネタなど"
        />
      </section>

      <section className="card">
        <h2>Todo</h2>

        <div className="taskInput">
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="やることを追加"
          />
          <button onClick={addTask}>追加</button>
        </div>

        <ul>
          {tasks.map((task, idx) => (
            <li key={idx}>
              <label>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => {
                    const updated = [...tasks]
                    updated[idx].done = !updated[idx].done
                    setTasks(updated)
                  }}
                />
                <span className={task.done ? 'done' : ''}>{task.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
