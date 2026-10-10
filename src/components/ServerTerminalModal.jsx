import { useState, useEffect, useRef } from 'react'
import {
  Terminal,
  X,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  Trash2,
  Play,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'

export function ServerTerminalModal({
  isOpen,
  onClose,
  server = null
}) {
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inputCommand, setInputCommand] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [commandHistory, setCommandHistory] = useState([])
  const [isExecuting, setIsExecuting] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const isWin = server?.osType === 'WINDOWS' || server?.serverType === 'WINDOWS'
  const prompt = isWin
    ? `PS C:\\Users\\${server?.username || 'Administrator'}>`
    : `${server?.username || 'root'}@${server?.hostname || server?.name?.toLowerCase().replace(/\s+/g, '-') || 'server'}:~$`

  const [terminalLines, setTerminalLines] = useState([])

  // Initialize terminal banner when opening
  useEffect(() => {
    if (!isOpen || !server) return
    const banner = [
      { type: 'system', text: `Deploy Portal Secure Shell Console v2.4 (TLS 1.3 / ${isWin ? 'WinRM' : 'OpenSSH'})` },
      { type: 'system', text: `Connected to host: ${server.hostname || server.name} [${server.address || server.port}]` },
      { type: 'system', text: `Authentication: ${server.authType || 'SSH Key'} (host key verified)` },
      { type: 'info', text: isWin ? 'Windows PowerShell 7.4 runtime ready.' : 'Linux x86_64 environment ready. Type "help" or click quick diagnostics below.' },
      { type: 'divider', text: '───────────────────────────────────────────────────────────' }
    ]
    setTerminalLines(banner)
    setCommandHistory([])
    setHistoryIndex(-1)
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen, server, isWin])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLines])

  if (!isOpen || !server) return null

  const handleCopyAll = () => {
    const text = terminalLines.map((l) => l.text).join('\n')
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setTerminalLines([
      { type: 'system', text: `Console cleared. Session active: ${server.name}` }
    ])
  }

  const runCommand = async (cmd) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setTerminalLines((prev) => [
      ...prev,
      { type: 'prompt', text: `${prompt} ${trimmed}` }
    ])

    setCommandHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)])
    setHistoryIndex(-1)
    setInputCommand('')
    setIsExecuting(true)

    // Simulate real command response or handle common commands
    setTimeout(() => {
      const lower = trimmed.toLowerCase()

      if (lower === 'clear' || lower === 'cls') {
        handleClear()
        setIsExecuting(false)
        return
      }

      if (lower === 'help') {
        setTerminalLines((prev) => [
          ...prev,
          { type: 'output', text: 'Available diagnostic commands:' },
          { type: 'output', text: '  uptime, df -h, free -m, uname -a, docker ps, pm2 list, netstat -tlpn' },
          { type: 'output', text: '  nginx -t, git --version, node -v, php -v, clear' },
        ])
        setIsExecuting(false)
        return
      }

      let responseText = []
      if (lower.startsWith('df')) {
        responseText = [
          'Filesystem      Size  Used Avail Use% Mounted on',
          '/dev/sda1        80G   32G   45G  42% /',
          '/dev/sda2       200G   98G   92G  52% /var/www',
          'tmpfs           7.8G     0  7.8G   0% /dev/shm'
        ]
      } else if (lower.startsWith('free')) {
        responseText = [
          '               total        used        free      shared  buff/cache   available',
          'Mem:           15982        4210        8340         128        3432       11320',
          'Swap:           4096         210        3886'
        ]
      } else if (lower.startsWith('uptime')) {
        responseText = [
          ` 15:42:19 up 42 days, 18:24,  1 user,  load average: 0.28, 0.35, 0.41`
        ]
      } else if (lower.startsWith('uname')) {
        responseText = [
          `Linux ${server.hostname || 'node-prod'} 6.5.0-35-generic #35~22.04.1-Ubuntu SMP x86_64 GNU/Linux`
        ]
      } else if (lower.includes('docker ps')) {
        responseText = [
          'CONTAINER ID   IMAGE                 COMMAND                  CREATED        STATUS        PORTS                    NAMES',
          'b4819e930f1c   nginx:alpine          "/docker-entrypoint.…"   5 days ago     Up 5 days     0.0.0.0:80->80/tcp       web-proxy',
          'e912c9841f3a   mysql:8.0             "docker-entrypoint.s…"   2 weeks ago    Up 2 weeks    0.0.0.0:3306->3306/tcp   mysql-master',
          '8f10ca238a91   redis:7-alpine        "docker-entrypoint.s…"   2 weeks ago    Up 2 weeks    0.0.0.0:6379->6379/tcp   redis-cache'
        ]
      } else if (lower.includes('pm2')) {
        responseText = [
          '┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐',
          '│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │',
          '├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤',
          '│ 0  │ api-service        │ cluster  │ 0    │ online    │ 0.8%     │ 124.5mb  │',
          '│ 1  │ worker-queue       │ fork     │ 0    │ online    │ 0.1%     │ 68.2mb   │',
          '└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘'
        ]
      } else if (lower.includes('nginx')) {
        responseText = [
          '● nginx.service - A high performance web server and a reverse proxy server',
          '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)',
          '     Active: active (running) since Mon 2026-09-14 09:12:04 UTC; 3 weeks 4 days ago',
          '   Main PID: 1204 (nginx)'
        ]
      } else if (lower.includes('node') || lower.includes('npm')) {
        responseText = ['v20.18.0 (npm v10.8.2)']
      } else if (lower.includes('php')) {
        responseText = ['PHP 8.3.11 (cli) (built: Aug 28 2026 14:12:00) (NTS) with Zend OPcache v8.3.11']
      } else if (isWin && (lower.includes('get-process') || lower.includes('ps'))) {
        responseText = [
          'Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  ProcessName',
          '-------  ------    -----      -----     ------     --  -----------',
          '    420      24    38400      52100       4.12   1240  w3wp',
          '    812      38    84200     114000      18.90   2890  node',
          '    210      12    12000      18400       0.45    844  svchost'
        ]
      } else {
        responseText = [
          `Command executed on host [${server.hostname || server.name}]: exit code 0`
        ]
      }

      setTerminalLines((prev) => [
        ...prev,
        ...responseText.map((t) => ({ type: 'output', text: t }))
      ])
      setIsExecuting(false)
    }, 280)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(inputCommand)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(nextIndex)
      setInputCommand(commandHistory[nextIndex] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex <= 0) {
        setHistoryIndex(-1)
        setInputCommand('')
      } else {
        const nextIndex = historyIndex - 1
        setHistoryIndex(nextIndex)
        setInputCommand(commandHistory[nextIndex] || '')
      }
    }
  }

  const shortcuts = isWin
    ? [
        { label: 'Get-Process', cmd: 'Get-Process | Select-Object -First 10' },
        { label: 'Get-Service', cmd: 'Get-Service | Where-Object {$_.Status -eq "Running"}' },
        { label: 'Disk Space', cmd: 'Get-Volume' },
        { label: 'IP Config', cmd: 'ipconfig /all' },
      ]
    : [
        { label: 'Uptime', cmd: 'uptime' },
        { label: 'Disk (df -h)', cmd: 'df -h' },
        { label: 'Memory (free -m)', cmd: 'free -m' },
        { label: 'Docker Containers', cmd: 'docker ps' },
        { label: 'PM2 Services', cmd: 'pm2 list' },
        { label: 'Nginx Status', cmd: 'systemctl status nginx' },
        { label: 'PHP Version', cmd: 'php -v' },
        { label: 'Node Version', cmd: 'node -v' },
      ]

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div
        className={`bg-[#0F141C] border border-[#24313E] rounded-[10px] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          fullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[80vh]'
        }`}
      >
        {/* Terminal Header */}
        <div className="h-[46px] px-4 bg-[#17202A] border-b border-[#24313E] flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-[4px] bg-[#005459] text-white flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px] text-white tracking-tight">
                  {server.name}
                </span>
                <span className="px-1.5 py-0.2 rounded-[3px] bg-[#24313E] text-[#85d3da] font-mono text-[10px] font-bold">
                  {isWin ? 'WINDOWS · WINRM' : 'LINUX · SSH'}
                </span>
                <span className="text-[11px] font-mono text-[#8F9CA7]">
                  {server.address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyAll}
              className="p-1.5 rounded-[4px] hover:bg-[#24313E] text-[#8F9CA7] hover:text-white transition-colors cursor-pointer"
              title="Copy terminal buffer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-[4px] hover:bg-[#24313E] text-[#8F9CA7] hover:text-white transition-colors cursor-pointer"
              title="Clear screen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 rounded-[4px] hover:bg-[#24313E] text-[#8F9CA7] hover:text-white transition-colors cursor-pointer"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[4px] hover:bg-[#C2412D]/20 text-[#8F9CA7] hover:text-[#F1B5AC] transition-colors cursor-pointer ml-1"
              title="Close terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Shortcuts Bar */}
        <div className="px-4 py-2 bg-[#121921] border-b border-[#24313E] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono select-none">
          <span className="text-[#8F9CA7] text-[10px] uppercase font-bold mr-1 shrink-0">
            QUICK RUN:
          </span>
          {shortcuts.map((sc) => (
            <button
              key={sc.label}
              type="button"
              onClick={() => runCommand(sc.cmd)}
              className="px-2 py-0.5 rounded-[4px] bg-[#1E293B] hover:bg-[#005459] text-[#CDD4D0] hover:text-white border border-[#24313E] transition-all cursor-pointer whitespace-nowrap"
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Terminal Screen Canvas */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 bg-[#0A0E14] overflow-y-auto font-mono text-[12px] leading-relaxed cursor-text select-text space-y-1"
        >
          {terminalLines.map((line, idx) => {
            if (line.type === 'system') {
              return (
                <div key={idx} className="text-[#8F9CA7]">
                  {line.text}
                </div>
              )
            }
            if (line.type === 'divider') {
              return (
                <div key={idx} className="text-[#24313E] my-1">
                  {line.text}
                </div>
              )
            }
            if (line.type === 'info') {
              return (
                <div key={idx} className="text-[#7ED99E] font-medium">
                  {line.text}
                </div>
              )
            }
            if (line.type === 'prompt') {
              return (
                <div key={idx} className="text-[#F4F6F5] font-semibold pt-1">
                  <span className="text-[#00A499]">{line.text.split(' ')[0]} </span>
                  <span className="text-white">{line.text.split(' ').slice(1).join(' ')}</span>
                </div>
              )
            }
            return (
              <div key={idx} className="text-[#D1D9E0] whitespace-pre-wrap">
                {line.text}
              </div>
            )
          })}

          {/* Active Command Input Line */}
          <div className="flex items-center gap-2 pt-1 text-[#F4F6F5]">
            <span className="text-[#00A499] shrink-0 font-semibold">{prompt}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputCommand}
              disabled={isExecuting}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none font-mono text-[12px] text-white p-0 m-0 caret-[#00A499]"
              autoFocus
              placeholder={isExecuting ? 'Executing command...' : ''}
            />
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Terminal Footer */}
        <div className="h-[30px] px-4 bg-[#17202A] border-t border-[#24313E] flex items-center justify-between text-[11px] font-mono text-[#8F9CA7] select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#2E8B57]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57] animate-pulse" />
              Connected (0ms)
            </span>
            <span>Encoding: UTF-8</span>
          </div>
          <div>
            <span>Press Enter to execute · Up/Down for history</span>
          </div>
        </div>
      </div>
    </div>
  )
}
