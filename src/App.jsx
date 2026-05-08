import { useEffect, useState } from 'react'

const defaultLinks = [
  { name: 'OpenES', url: 'https://open-es.com/' },
  { name: 'マイナビ', url: 'https://job.mynavi.jp/' },
  { name: 'リクナビ', url: 'https://job.rikunabi.com/' }
]

export default function App() {
  const [memo, setMemo] = useState(localStorage.getItem('memo') || '')
  const [links, setLinks] = useState(
    JSON.parse(localStorage.getItem('links') || JSON.stringify(defaultLinks))
  )
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem('tasks') || '[]')
  )
  const [taskInput, setTaskInput] = useState('')

  useEffect(() => {
    localStorage.setItem('memo', memo)
  }, [memo])

  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links))
  }, [links])

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!taskInput.trim()) return
    setTasks([...tasks, { text: taskInput, done: false }])
    setTaskInput('')
  }

  const toggleTask = (idx) => {
    const updated = [...tasks]
    updated[idx].done = !updated[idx].done
    setTasks(updated)
  }

  return (
    <div className="container">
      <header>
        <h1>就活Hub</h1>
        <p>就活用の自分専用ダッシュボード</p>
      </header>

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
                  onChange={() => toggleTask(idx)}
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
