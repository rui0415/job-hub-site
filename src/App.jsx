import { useEffect, useState } from 'react'

const defaultLinks = [
  { name: 'OpenES', url: 'https://open-es.com/' },
  { name: 'マイナビ', url: 'https://job.mynavi.jp/' },
  { name: 'リクナビ', url: 'https://job.rikunabi.com/' }
]

const statuses = ['ES', 'SPI', '一次面接', '最終面接', '内定']

export default function App() {
  const [memo, setMemo] = useState(localStorage.getItem('memo') || '')
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')
  const [companyName, setCompanyName] = useState('')
  const [companies, setCompanies] = useState(
    JSON.parse(localStorage.getItem('companies') || '[]')
  )

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
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!taskInput.trim()) return
    setTasks([...tasks, { text: taskInput, done: false }])
    setTaskInput('')
  }

  const addCompany = () => {
    if (!companyName.trim()) return
    setCompanies([...companies, { name: companyName, status: 'ES' }])
    setCompanyName('')
  }

  const updateStatus = (idx, status) => {
    const updated = [...companies]
    updated[idx].status = status
    setCompanies(updated)
  }

  return (
    <div className="container">
      <header className="headerRow">
        <div>
          <h1>就活Hub</h1>
          <p>就活用の自分専用ダッシュボード</p>
        </div>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'ライトモード' : 'ダークモード'}
        </button>
      </header>

      <section className="card">
        <h2>企業進捗管理</h2>

        <div className="taskInput">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="企業名を追加"
          />
          <button onClick={addCompany}>追加</button>
        </div>

        <div className="companyList">
          {companies.map((company, idx) => (
            <div key={idx} className="companyCard">
              <strong>{company.name}</strong>

              <select
                value={company.status}
                onChange={(e) => updateStatus(idx, e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
