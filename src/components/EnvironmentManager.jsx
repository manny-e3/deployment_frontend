import { useState, useEffect, useMemo } from 'react'
import {
  KeyRound,
  Database,
  Terminal,
  Upload,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  FileCode,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  FileUp,
  Layers,
  Info,
  ArrowRightLeft,
  GitCompare
} from 'lucide-react'
import { api } from '../services/api'

export function EnvironmentManager({ projectId, targets = [], canManage = true, onEnvUpdated }) {
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.id || '')
  const [subTab, setSubTab] = useState('env') // 'env' | 'database' | 'artisan' | 'diff'
  
  // Env editor state
  const [envVars, setEnvVars] = useState([])
  const [rawEnvMode, setRawEnvMode] = useState(false)
  const [rawEnvText, setRawEnvText] = useState('')
  const [hiddenKeys, setHiddenKeys] = useState(new Set())
  const [loadingEnv, setLoadingEnv] = useState(false)
  const [savingEnv, setSavingEnv] = useState(false)
  const [envSuccess, setEnvSuccess] = useState(null)
  const [envError, setEnvError] = useState(null)

  // SQL Upload state
  const [sqlFile, setSqlFile] = useState(null)
  const [sqlFileName, setSqlFileName] = useState('')
  const [sqlFileSize, setSqlFileSize] = useState(0)
  const [sqlContent, setSqlContent] = useState('')
  const [dbName, setDbName] = useState('')
  const [dbUser, setDbUser] = useState('')
  const [dbPass, setDbPass] = useState('')
  const [dbHost, setDbHost] = useState('127.0.0.1')
  const [dbPort, setDbPort] = useState('3306')
  const [isImportingSql, setIsImportingSql] = useState(false)
  const [sqlImportResult, setSqlImportResult] = useState(null)
  const [sqlImportError, setSqlImportError] = useState(null)

  // Artisan state
  const [artisanCmd, setArtisanCmd] = useState('')
  const [isRunningArtisan, setIsRunningArtisan] = useState(false)
  const [artisanOutput, setArtisanOutput] = useState(null)
  const [artisanError, setArtisanError] = useState(null)

  // Diff & Compare state
  const [diffTargetBId, setDiffTargetBId] = useState(targets[1]?.id || targets[0]?.id || '')
  const [diffVarsB, setDiffVarsB] = useState({})
  const [loadingDiff, setLoadingDiff] = useState(false)
  const [diffFilter, setDiffFilter] = useState('all') // 'all' | 'missing' | 'mismatch'
  const [diffSyncSuccess, setDiffSyncSuccess] = useState(null)

  // Update selected target when targets prop loads
  useEffect(() => {
    if (!selectedTargetId && targets.length > 0) {
      setSelectedTargetId(targets[0].id)
    }
    if (targets.length > 1 && (!diffTargetBId || diffTargetBId === selectedTargetId)) {
      setDiffTargetBId(targets.find((t) => t.id !== selectedTargetId)?.id || targets[0].id)
    }
  }, [targets, selectedTargetId, diffTargetBId])

  // Fetch target environment variables whenever selected target changes
  useEffect(() => {
    if (!selectedTargetId) return

    const fetchEnv = async () => {
      setLoadingEnv(true)
      setEnvError(null)
      setEnvSuccess(null)
      try {
        // Try getting full decrypted env vars
        const res = await api(`/targets/${selectedTargetId}/env-full`).catch(() => null)
        let varsMap = {}
        if (res && res.vars) {
          varsMap = res.vars
        } else {
          // Fallback to keys
          const keysRes = await api(`/targets/${selectedTargetId}/env`).catch(() => null)
          if (keysRes && Array.isArray(keysRes.keys)) {
            keysRes.keys.forEach((k) => {
              varsMap[k] = ''
            })
          }
        }

        const entries = Object.entries(varsMap).map(([key, value]) => ({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value: String(value || '')
        }))

        setEnvVars(entries)
        setRawEnvText(entries.map((e) => `${e.key}=${e.value}`).join('\n'))

        // Pre-populate DB credentials for SQL upload tab if available
        if (varsMap.DB_DATABASE) setDbName(varsMap.DB_DATABASE)
        if (varsMap.DB_USERNAME) setDbUser(varsMap.DB_USERNAME)
        if (varsMap.DB_PASSWORD) setDbPass(varsMap.DB_PASSWORD)
        if (varsMap.DB_HOST) setDbHost(varsMap.DB_HOST)
        if (varsMap.DB_PORT) setDbPort(varsMap.DB_PORT)

        // Hide values for sensitive keys by default
        const sensitive = new Set()
        entries.forEach((e) => {
          if (/PASS|KEY|SECRET|TOKEN|AUTH/i.test(e.key)) {
            sensitive.add(e.id)
          }
        })
        setHiddenKeys(sensitive)
      } catch (err) {
        console.error('Failed to load target env:', err)
        setEnvError('Failed to load environment variables for this target.')
      } finally {
        setLoadingEnv(false)
      }
    }

    fetchEnv()
  }, [selectedTargetId])

  // Fetch Target B env when in Diff tab
  const fetchDiffTargetB = async (targetId) => {
    if (!targetId) return
    setLoadingDiff(true)
    try {
      const res = await api(`/targets/${targetId}/env-full`).catch(() => null)
      let varsMap = {}
      if (res && res.vars) {
        varsMap = res.vars
      } else {
        const keysRes = await api(`/targets/${targetId}/env`).catch(() => null)
        if (keysRes && Array.isArray(keysRes.keys)) {
          keysRes.keys.forEach((k) => {
            varsMap[k] = ''
          })
        }
      }
      setDiffVarsB(varsMap)
    } catch (err) {
      console.error('Failed to load target B env for diff:', err)
      setDiffVarsB({})
    } finally {
      setLoadingDiff(false)
    }
  }

  useEffect(() => {
    if (subTab === 'diff' && diffTargetBId) {
      fetchDiffTargetB(diffTargetBId)
    }
  }, [subTab, diffTargetBId])

  // Compute diff comparison between selectedTargetId (A) and diffTargetBId (B)
  const diffComparison = useMemo(() => {
    const mapA = {}
    envVars.forEach((e) => {
      if (e.key) mapA[e.key] = e.value
    })
    const mapB = diffVarsB || {}
    const allKeys = Array.from(new Set([...Object.keys(mapA), ...Object.keys(mapB)])).sort()

    return allKeys.map((k) => {
      const inA = k in mapA
      const inB = k in mapB
      const valA = inA ? mapA[k] : undefined
      const valB = inB ? mapB[k] : undefined

      let status = 'MATCH'
      if (inA && !inB) status = 'MISSING_IN_B'
      else if (!inA && inB) status = 'MISSING_IN_A'
      else if (valA !== valB) status = 'MISMATCH'

      return { key: k, valA, valB, inA, inB, status }
    })
  }, [envVars, diffVarsB])

  const handleSyncKeyToB = async (key, val) => {
    if (!diffTargetBId) return
    try {
      const updatedMap = { ...diffVarsB, [key]: val }
      await api(`/targets/${diffTargetBId}/env`, {
        method: 'PUT',
        body: { vars: updatedMap }
      })
      setDiffVarsB(updatedMap)
      setDiffSyncSuccess(`Synced "${key}" to destination target.`)
      setTimeout(() => setDiffSyncSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to sync key:', err)
    }
  }

  const handleSyncAllMissingToB = async () => {
    if (!diffTargetBId) return
    const missing = diffComparison.filter((d) => d.status === 'MISSING_IN_B')
    if (missing.length === 0) return

    try {
      const updatedMap = { ...diffVarsB }
      missing.forEach((m) => {
        updatedMap[m.key] = m.valA
      })
      await api(`/targets/${diffTargetBId}/env`, {
        method: 'PUT',
        body: { vars: updatedMap }
      })
      setDiffVarsB(updatedMap)
      setDiffSyncSuccess(`Successfully synced ${missing.length} missing variable(s) to destination target.`)
      setTimeout(() => setDiffSyncSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to sync missing keys:', err)
    }
  }

  // Switch between Table and Raw Text modes
  const handleToggleRawMode = () => {
    if (!rawEnvMode) {
      // Switching to Raw: compile entries to text
      const text = envVars.map((e) => `${e.key}=${e.value}`).join('\n')
      setRawEnvText(text)
      setRawEnvMode(true)
    } else {
      // Switching to Table: parse text to entries
      const lines = rawEnvText.split('\n')
      const newEntries = []
      lines.forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const idx = trimmed.indexOf('=')
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim()
          let val = trimmed.slice(idx + 1).trim()
          // remove surrounding quotes if present
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          newEntries.push({
            id: Math.random().toString(36).substring(2, 9),
            key,
            value: val
          })
        }
      })
      setEnvVars(newEntries)
      setRawEnvMode(false)
    }
  }

  // Add variable row
  const handleAddVar = () => {
    setEnvVars((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), key: '', value: '' }
    ])
  }

  // Remove variable row
  const handleRemoveVar = (id) => {
    setEnvVars((prev) => prev.filter((e) => e.id !== id))
  }

  // Update key/value in entry
  const handleUpdateVar = (id, field, val) => {
    setEnvVars((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    )
  }

  // Toggle eye visibility
  const toggleVisibility = (id) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Load Laravel Env Template
  const loadLaravelPreset = () => {
    // Generate secure 32-byte base64 AES key
    let autoKey = ''
    try {
      const bytes = new Uint8Array(32)
      window.crypto.getRandomValues(bytes)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      autoKey = 'base64:' + btoa(binary)
    } catch {
      autoKey = 'base64:' + btoa(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2))
    }

    const template = [
      { key: 'APP_NAME', value: 'Laravel App' },
      { key: 'APP_ENV', value: 'production' },
      { key: 'APP_KEY', value: autoKey },
      { key: 'APP_DEBUG', value: 'false' },
      { key: 'APP_URL', value: 'https://example.com' },
      { key: 'LOG_CHANNEL', value: 'stack' },
      { key: 'LOG_LEVEL', value: 'error' },
      { key: 'DB_CONNECTION', value: 'mysql' },
      { key: 'DB_HOST', value: '127.0.0.1' },
      { key: 'DB_PORT', value: '3306' },
      { key: 'DB_DATABASE', value: 'laravel_db' },
      { key: 'DB_USERNAME', value: 'root' },
      { key: 'DB_PASSWORD', value: '' },
      { key: 'BROADCAST_DRIVER', value: 'log' },
      { key: 'CACHE_DRIVER', value: 'file' },
      { key: 'FILESYSTEM_DISK', value: 'local' },
      { key: 'QUEUE_CONNECTION', value: 'database' },
      { key: 'SESSION_DRIVER', value: 'file' },
      { key: 'SESSION_LIFETIME', value: '120' }
    ]

    const entries = template.map((t) => ({
      id: Math.random().toString(36).substring(2, 9),
      key: t.key,
      value: t.value
    }))
    setEnvVars(entries)
    setRawEnvText(entries.map((e) => `${e.key}=${e.value}`).join('\n'))
    setEnvSuccess('Populated full Laravel environment template with generated APP_KEY.')
  }

  // Load React (Vite / CRA) Env Template
  const loadReactPreset = () => {
    const template = [
      { key: 'VITE_API_URL', value: 'https://api.example.com/api/v1' },
      { key: 'VITE_APP_NAME', value: 'React Application' },
      { key: 'VITE_APP_ENV', value: 'production' },
      { key: 'PORT', value: '3000' }
    ]

    const entries = template.map((t) => ({
      id: Math.random().toString(36).substring(2, 9),
      key: t.key,
      value: t.value
    }))
    setEnvVars(entries)
    setRawEnvText(entries.map((e) => `${e.key}=${e.value}`).join('\n'))
    setEnvSuccess('Populated React (Vite) environment template.')
  }

  // Save Environment Variables
  const handleSaveEnv = async () => {
    if (!selectedTargetId) return
    setSavingEnv(true)
    setEnvError(null)
    setEnvSuccess(null)

    try {
      let finalMap = {}
      if (rawEnvMode) {
        const lines = rawEnvText.split('\n')
        lines.forEach((line) => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) return
          const idx = trimmed.indexOf('=')
          if (idx > 0) {
            const k = trimmed.slice(0, idx).trim()
            let v = trimmed.slice(idx + 1).trim()
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1)
            }
            if (k) finalMap[k] = v
          }
        })
      } else {
        envVars.forEach((e) => {
          const k = e.key.trim()
          if (k) {
            finalMap[k] = e.value
          }
        })
      }

      await api(`/targets/${selectedTargetId}/env`, {
        method: 'PUT',
        body: { vars: finalMap }
      })

      setEnvSuccess(`Successfully saved ${Object.keys(finalMap).length} environment variables.`)
      if (onEnvUpdated) onEnvUpdated()

      // Also update database defaults
      if (finalMap.DB_DATABASE) setDbName(finalMap.DB_DATABASE)
      if (finalMap.DB_USERNAME) setDbUser(finalMap.DB_USERNAME)
      if (finalMap.DB_PASSWORD) setDbPass(finalMap.DB_PASSWORD)
      if (finalMap.DB_HOST) setDbHost(finalMap.DB_HOST)
      if (finalMap.DB_PORT) setDbPort(finalMap.DB_PORT)
    } catch (err) {
      console.error('Failed to save env:', err)
      setEnvError(err.message || 'Failed to save environment variables. Ensure variable names match [A-Z_0-9].')
    } finally {
      setSavingEnv(false)
    }
  }

  // Handle SQL File Selection
  const handleSqlFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSqlFile(file)
    setSqlFileName(file.name)
    setSqlFileSize((file.size / (1024 * 1024)).toFixed(2))
    setSqlImportError(null)
    setSqlImportResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setSqlContent(event.target.result)
    }
    reader.onerror = () => {
      setSqlImportError('Could not read the selected SQL file.')
    }
    reader.readAsText(file)
  }

  // Handle SQL Import Execution
  const handleImportSql = async (e) => {
    e.preventDefault()
    if (!selectedTargetId) return
    if (!sqlContent.trim()) {
      setSqlImportError('Please select a valid .sql file containing SQL queries or dump data.')
      return
    }

    if (!dbName.trim()) {
      setSqlImportError('Target Database name is required.')
      return
    }

    setIsImportingSql(true)
    setSqlImportError(null)
    setSqlImportResult(null)

    try {
      const res = await api(`/targets/${selectedTargetId}/import-sql`, {
        method: 'POST',
        body: {
          sqlContent,
          dbName: dbName.trim(),
          dbUser: dbUser.trim() || undefined,
          dbPass: dbPass !== undefined ? dbPass : undefined,
          dbHost: dbHost.trim() || undefined,
          dbPort: dbPort.trim() || undefined,
        }
      })

      setSqlImportResult(res?.message || `Successfully imported ${sqlFileName} into database '${dbName}'!`)
    } catch (err) {
      console.error('SQL import failed:', err)
      setSqlImportError(err.message || 'Failed to import SQL dump to remote database.')
    } finally {
      setIsImportingSql(false)
    }
  }

  // Handle Artisan Command Run
  const handleRunArtisan = async (commandToRun) => {
    const cmd = commandToRun || artisanCmd
    if (!selectedTargetId || !cmd.trim()) return

    setIsRunningArtisan(true)
    setArtisanError(null)
    setArtisanOutput(null)

    try {
      const res = await api(`/targets/${selectedTargetId}/artisan`, {
        method: 'POST',
        body: { command: cmd.trim() }
      })

      setArtisanOutput({
        command: cmd.trim(),
        exitCode: res.exitCode,
        output: res.output || '(No output returned)',
        ok: res.ok
      })
    } catch (err) {
      console.error('Artisan execution failed:', err)
      setArtisanError(err.message || 'Failed to execute artisan command.')
    } finally {
      setIsRunningArtisan(false)
    }
  }

  if (targets.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-10 text-center shadow-xs">
        <Server className="w-10 h-10 text-[#8F9CA7] mx-auto mb-3 stroke-[1.5]" />
        <h3 className="text-[15px] font-semibold text-[#101d26]">No Target Server Configured</h3>
        <p className="text-[12px] text-[#565f6b] mt-1 max-w-md mx-auto">
          Please add a deployment target server in the <strong>Servers</strong> tab first to manage environment variables, upload databases, or execute artisan commands.
        </p>
      </div>
    )
  }

  const currentTarget = targets.find((t) => t.id === selectedTargetId) || targets[0]

  return (
    <div className="space-y-4">
      {/* Target Selector & Sub-Navigation */}
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Target Picker */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#565f6b] font-semibold">Active Destination Target</div>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="text-[13px] font-semibold text-[#101d26] bg-transparent outline-none cursor-pointer border-b border-dotted border-[#005459]"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.server?.name || t.host} ({t.targetDir || t.path})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px]">
          <button
            type="button"
            onClick={() => setSubTab('env')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'env'
                ? 'bg-[#FFFFFF] text-[#005459] shadow-2xs font-semibold'
                : 'text-[#565f6b] hover:text-[#101d26]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>.env Variables</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('database')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'database'
                ? 'bg-[#FFFFFF] text-[#005459] shadow-2xs font-semibold'
                : 'text-[#565f6b] hover:text-[#101d26]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Custom DB (.sql) Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('artisan')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'artisan'
                ? 'bg-[#FFFFFF] text-[#005459] shadow-2xs font-semibold'
                : 'text-[#565f6b] hover:text-[#101d26]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Artisan &amp; Migrations</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('diff')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              subTab === 'diff'
                ? 'bg-[#FFFFFF] text-[#005459] shadow-2xs font-semibold'
                : 'text-[#565f6b] hover:text-[#101d26]'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Compare &amp; Sync</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ENVIRONMENT VARIABLES */}
      {subTab === 'env' && (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-[#E2E7E4] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-semibold text-[#101d26] flex items-center gap-2">
                <span>Environment Configuration (.env)</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded bg-[#F4F6F5] text-[#565f6b]">
                  {envVars.length} variables
                </span>
              </h3>
              <p className="text-[11px] text-[#565f6b] mt-0.5">
                Injected securely during build. Stored encrypted on the deployment server and written to <code className="font-mono text-[#005459]">{currentTarget.path || currentTarget.targetDir}/.env</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadReactPreset}
                className="h-[30px] px-2.5 rounded-[6px] border border-[#B8E0C5] bg-[#EAF5EE] hover:bg-[#D5EFE0] text-[11px] font-semibold text-[#005459] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Populate standard React / Vite environment variables"
              >
                <Sparkles className="w-3 h-3 text-[#005459]" />
                <span>React (Vite) Preset</span>
              </button>

              <button
                type="button"
                onClick={loadLaravelPreset}
                className="h-[30px] px-2.5 rounded-[6px] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[11px] font-medium text-[#101d26] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Populate standard Laravel keys"
              >
                <Sparkles className="w-3 h-3 text-[#565f6b]" />
                <span>Laravel Preset</span>
              </button>

              <button
                type="button"
                onClick={handleToggleRawMode}
                className="h-[30px] px-2.5 rounded-[6px] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[11px] font-medium text-[#101d26] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-3 h-3 text-[#565f6b]" />
                <span>{rawEnvMode ? 'Table Mode' : 'Raw Text Mode'}</span>
              </button>

              {canManage && (
                <button
                  type="button"
                  onClick={handleSaveEnv}
                  disabled={savingEnv || loadingEnv}
                  className="h-[30px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingEnv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingEnv ? 'Saving...' : 'Save .env'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback banners */}
          {envSuccess && (
            <div className="mx-5 mt-4 p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-center justify-between text-[#2E8B57] text-[12px]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{envSuccess}</span>
              </div>
              <button type="button" onClick={() => setEnvSuccess(null)} className="text-[11px] underline cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {envError && (
            <div className="mx-5 mt-4 p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center justify-between text-[#C2412D] text-[12px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{envError}</span>
              </div>
              <button type="button" onClick={() => setEnvError(null)} className="text-[11px] underline cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {/* Content Body */}
          <div className="p-5">
            {loadingEnv ? (
              <div className="py-12 text-center text-[#565f6b] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#005459]" />
                <span className="text-[12px]">Loading environment variables...</span>
              </div>
            ) : rawEnvMode ? (
              <div className="space-y-2">
                <textarea
                  value={rawEnvText}
                  onChange={(e) => setRawEnvText(e.target.value)}
                  rows={14}
                  placeholder="KEY=VALUE"
                  className="w-full p-3 font-mono text-[12px] bg-[#F8FAF9] border border-[#CDD4D0] rounded-[6px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 leading-relaxed"
                />
                <p className="text-[11px] text-[#565f6b]">
                  Paste multiple variables in <code>KEY=VALUE</code> format. Lines starting with <code>#</code> are ignored.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {envVars.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-[#CDD4D0] rounded-[6px]">
                    <KeyRound className="w-6 h-6 text-[#8F9CA7] mx-auto mb-2" />
                    <div className="text-[13px] font-semibold text-[#101d26]">No environment variables configured</div>
                    <p className="text-[11px] text-[#565f6b] mt-0.5">
                      Add variables manually or click <strong>Laravel Preset</strong> above.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddVar}
                      className="mt-3 h-[30px] px-3 rounded-[6px] border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variable</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {envVars.map((item) => {
                      const isHidden = hiddenKeys.has(item.id)
                      return (
                        <div key={item.id} className="flex items-center gap-2">
                          {/* Key */}
                          <div className="w-1/3">
                            <input
                              type="text"
                              value={item.key}
                              onChange={(e) => handleUpdateVar(item.id, 'key', e.target.value)}
                              placeholder="KEY_NAME"
                              className="w-full h-[34px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 uppercase"
                            />
                          </div>

                          {/* Value with eye toggle */}
                          <div className="flex-1 relative flex items-center">
                            <input
                              type={isHidden ? 'password' : 'text'}
                              value={item.value}
                              onChange={(e) => handleUpdateVar(item.id, 'value', e.target.value)}
                              placeholder="value"
                              className="w-full h-[34px] pl-2.5 pr-8 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                            />
                            <button
                              type="button"
                              onClick={() => toggleVisibility(item.id)}
                              className="absolute right-2 text-[#8F9CA7] hover:text-[#101d26] p-1 cursor-pointer"
                              title={isHidden ? 'Show value' : 'Mask value'}
                            >
                              {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveVar(item.id)}
                            className="h-[34px] w-[34px] rounded-[6px] border border-[#CDD4D0] hover:bg-[#FAEBE9] hover:border-[#F1B5AC] text-[#8F9CA7] hover:text-[#C2412D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="Remove variable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddVar}
                        className="h-[32px] px-3 rounded-[6px] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#005459]" />
                        <span>Add Variable</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CUSTOM DB (.SQL) UPLOAD */}
      {subTab === 'database' && (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-[#E2E7E4]">
            <h3 className="text-[14px] font-semibold text-[#101d26] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#005459]" />
              <span>Custom Database Upload (.sql Import)</span>
            </h3>
            <p className="text-[11px] text-[#565f6b] mt-0.5">
              Directly upload your custom MySQL database export to stream into the remote server over SSH. Perfect for Laravel projects where migrations are not used.
            </p>
          </div>

          <form onSubmit={handleImportSql} className="p-6 space-y-5">
            {sqlImportResult && (
              <div className="p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-center justify-between text-[#2E8B57] text-[13px]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{sqlImportResult}</span>
                </div>
                <button type="button" onClick={() => setSqlImportResult(null)} className="text-[11px] underline cursor-pointer">
                  Dismiss
                </button>
              </div>
            )}

            {sqlImportError && (
              <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center justify-between text-[#C2412D] text-[13px]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sqlImportError}</span>
                </div>
                <button type="button" onClick={() => setSqlImportError(null)} className="text-[11px] underline cursor-pointer">
                  Dismiss
                </button>
              </div>
            )}

            {/* File Dropzone */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1.5">
                SELECT .SQL DUMP FILE <span className="text-[#C2412D]">*</span>
              </label>
              <div className="border-2 border-dashed border-[#CDD4D0] hover:border-[#005459] rounded-[8px] p-6 text-center bg-[#F8FAF9] transition-colors relative">
                <input
                  type="file"
                  accept=".sql"
                  onChange={handleSqlFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileUp className="w-8 h-8 text-[#005459] mx-auto mb-2" />
                {sqlFileName ? (
                  <div>
                    <div className="text-[13px] font-semibold text-[#101d26]">{sqlFileName}</div>
                    <div className="text-[11px] text-[#565f6b] font-mono mt-0.5">{sqlFileSize} MB • Ready to import</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[13px] font-semibold text-[#101d26]">Click or drop .sql file here</div>
                    <div className="text-[11px] text-[#565f6b] mt-0.5">Supports standard MySQL / MariaDB dumps up to 50 MB</div>
                  </div>
                )}
              </div>
            </div>

            {/* Target MySQL Connection Details */}
            <div className="p-4 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b]">
                REMOTE MYSQL DESTINATION (AUTO-LOADED FROM TARGET .ENV)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#565f6b] mb-1 font-medium">Database Name</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder="e.g. travaiqc_laravel"
                    className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] rounded-[4px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#565f6b] mb-1 font-medium">Database User</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    placeholder="e.g. travaiqc_admin"
                    className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] rounded-[4px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#565f6b] mb-1 font-medium">Database Password</label>
                  <input
                    type="password"
                    value={dbPass}
                    onChange={(e) => setDbPass(e.target.value)}
                    placeholder="MySQL password"
                    className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] rounded-[4px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-[#565f6b] mb-1 font-medium">MySQL Host</label>
                  <input
                    type="text"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    placeholder="127.0.0.1"
                    className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] rounded-[4px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#565f6b] mb-1 font-medium">MySQL Port</label>
                  <input
                    type="text"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    placeholder="3306"
                    className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] rounded-[4px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isImportingSql || !sqlFile || !canManage}
                className="h-[36px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isImportingSql ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Streaming SQL to Server...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Import SQL to Database</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: ARTISAN & MIGRATION CONSOLE */}
      {subTab === 'artisan' && (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs space-y-4 p-5">
          <div>
            <h3 className="text-[14px] font-semibold text-[#101d26] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#005459]" />
              <span>Laravel Artisan Commands & Database Migrations</span>
            </h3>
            <p className="text-[11px] text-[#565f6b] mt-0.5">
              Execute artisan commands directly inside target directory <code className="font-mono text-[#005459]">{currentTarget.path || currentTarget.targetDir}</code> over SSH.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              disabled={isRunningArtisan || !canManage}
              onClick={() => handleRunArtisan('migrate --force')}
              className="p-3 text-left bg-[#F8FAF9] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#BEDAF2] rounded-[6px] transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="text-[12px] font-semibold text-[#101d26] group-hover:text-[#005459] flex items-center gap-1.5">
                <Play className="w-3 h-3 text-[#005459]" />
                <span>Run Migrations</span>
              </div>
              <div className="text-[10px] font-mono text-[#565f6b] mt-1">php artisan migrate --force</div>
            </button>

            <button
              type="button"
              disabled={isRunningArtisan || !canManage}
              onClick={() => handleRunArtisan('migrate:status')}
              className="p-3 text-left bg-[#F8FAF9] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#BEDAF2] rounded-[6px] transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="text-[12px] font-semibold text-[#101d26] group-hover:text-[#005459] flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#005459]" />
                <span>Migration Status</span>
              </div>
              <div className="text-[10px] font-mono text-[#565f6b] mt-1">php artisan migrate:status</div>
            </button>

            <button
              type="button"
              disabled={isRunningArtisan || !canManage}
              onClick={() => handleRunArtisan('optimize')}
              className="p-3 text-left bg-[#F8FAF9] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#BEDAF2] rounded-[6px] transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="text-[12px] font-semibold text-[#101d26] group-hover:text-[#005459] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#005459]" />
                <span>Cache & Optimize</span>
              </div>
              <div className="text-[10px] font-mono text-[#565f6b] mt-1">php artisan optimize</div>
            </button>

            <button
              type="button"
              disabled={isRunningArtisan || !canManage}
              onClick={() => handleRunArtisan('optimize:clear')}
              className="p-3 text-left bg-[#F8FAF9] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#BEDAF2] rounded-[6px] transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="text-[12px] font-semibold text-[#101d26] group-hover:text-[#005459] flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 text-[#005459]" />
                <span>Clear All Caches</span>
              </div>
              <div className="text-[10px] font-mono text-[#565f6b] mt-1">php artisan optimize:clear</div>
            </button>

            <button
              type="button"
              disabled={isRunningArtisan || !canManage}
              onClick={() => handleRunArtisan('storage:link')}
              className="p-3 text-left bg-[#F8FAF9] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#BEDAF2] rounded-[6px] transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="text-[12px] font-semibold text-[#101d26] group-hover:text-[#005459] flex items-center gap-1.5">
                <Info className="w-3 h-3 text-[#005459]" />
                <span>Link Storage</span>
              </div>
              <div className="text-[10px] font-mono text-[#565f6b] mt-1">php artisan storage:link</div>
            </button>

            <button
              type="button"
              disabled={isRunningArtisan || !canManage}
              onClick={() => handleRunArtisan('key:generate --force')}
              className="p-3 text-left bg-[#F8FAF9] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#BEDAF2] rounded-[6px] transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="text-[12px] font-semibold text-[#101d26] group-hover:text-[#005459] flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-[#005459]" />
                <span>Generate App Key</span>
              </div>
              <div className="text-[10px] font-mono text-[#565f6b] mt-1">php artisan key:generate</div>
            </button>
          </div>

          {/* Custom Command Runner */}
          <div className="pt-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1.5">
              CUSTOM ARTISAN COMMAND
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-[12px] font-mono text-[#565f6b] font-semibold pointer-events-none">
                  php artisan
                </span>
                <input
                  type="text"
                  value={artisanCmd}
                  onChange={(e) => setArtisanCmd(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunArtisan()
                  }}
                  placeholder="route:list or db:seed --force"
                  className="w-full h-[36px] pl-24 pr-3 bg-white border border-[#CDD4D0] rounded-[6px] font-mono text-[12px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                />
              </div>
              <button
                type="button"
                disabled={isRunningArtisan || !artisanCmd.trim() || !canManage}
                onClick={() => handleRunArtisan()}
                className="h-[36px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isRunningArtisan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isRunningArtisan ? 'Running...' : 'Execute'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          {artisanError && (
            <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center justify-between text-[#C2412D] text-[12px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{artisanError}</span>
              </div>
            </div>
          )}

          {artisanOutput && (
            <div className="mt-4 rounded-[6px] border border-[#101D26] overflow-hidden bg-[#0A1218] text-[#E2E7E4] shadow-sm">
              <div className="px-3.5 py-2 bg-[#101D26] border-b border-[#1E2E38] flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-2 text-[#8F9CA7]">
                  <span className={`w-2 h-2 rounded-full ${artisanOutput.ok ? 'bg-[#2E8B57]' : 'bg-[#C2412D]'}`} />
                  Command: <strong className="text-white">php artisan {artisanOutput.command}</strong>
                </span>
                <span className="text-[#8F9CA7]">Exit Code: {artisanOutput.exitCode}</span>
              </div>
              <pre className="p-3.5 text-[12px] font-mono whitespace-pre-wrap overflow-x-auto max-h-[300px] leading-relaxed text-[#D1D9E0]">
                {artisanOutput.output}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: COMPARE & SYNC (.ENV DIFF) */}
      {subTab === 'diff' && (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-[#E2E7E4] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-[#101d26]">
                  Target Configuration Compare &amp; Sync
                </h3>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] text-[#005459] font-mono text-[10px] font-bold border border-[#BEDDF7]">
                  DIFF ENGINE v2.1
                </span>
              </div>
              <p className="text-[11px] text-[#565f6b] mt-0.5">
                Inspect variable parity between targets (e.g. Staging vs Production) and copy missing keys with zero human error.
              </p>
            </div>

            {/* Target Selectors */}
            <div className="flex items-center gap-2 text-[12px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0]">
                <span className="text-[#565f6b] text-[11px]">Source (A):</span>
                <strong className="text-[#005459] font-medium">
                  {targets.find((t) => t.id === selectedTargetId)?.name || 'Target A'}
                </strong>
              </div>

              <span className="text-[#8F9CA7] font-bold">➔</span>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0]">
                <span className="text-[#565f6b] text-[11px]">Destination (B):</span>
                <select
                  value={diffTargetBId}
                  onChange={(e) => setDiffTargetBId(e.target.value)}
                  className="bg-transparent font-medium text-[#101d26] outline-none cursor-pointer"
                >
                  {targets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={handleSyncAllMissingToB}
                  disabled={diffComparison.filter((d) => d.status === 'MISSING_IN_B').length === 0}
                  className="h-[32px] px-3 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] disabled:opacity-40 text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Sync All Missing to B</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {diffSyncSuccess && (
            <div className="m-4 p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-center justify-between text-[#2E8B57] text-[12px]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{diffSyncSuccess}</span>
              </div>
            </div>
          )}

          {/* Metric Summary Ribbon & Filter */}
          <div className="px-5 py-2.5 bg-[#FAFBFB] border-b border-[#E2E7E4] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#565f6b]">Total Keys: <strong>{diffComparison.length}</strong></span>
              <span>•</span>
              <span className="text-[#B87E0C] font-semibold">
                Missing in B: {diffComparison.filter((d) => d.status === 'MISSING_IN_B').length}
              </span>
              <span>•</span>
              <span className="text-[#6B46C1] font-semibold">
                Mismatched Values: {diffComparison.filter((d) => d.status === 'MISMATCH').length}
              </span>
              <span>•</span>
              <span className="text-[#2E8B57] font-semibold">
                In Sync: {diffComparison.filter((d) => d.status === 'MATCH').length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[#565f6b] mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All Keys' },
                { id: 'missing', label: 'Missing in B' },
                { id: 'mismatch', label: 'Differences' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDiffFilter(f.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                    diffFilter === f.id
                      ? 'bg-[#005459] text-white'
                      : 'bg-[#F4F6F5] hover:bg-[#EAEAEA] text-[#565f6b]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="h-[34px] bg-[#F4F6F5] border-b border-[#CDD4D0] text-[#565f6b] font-semibold text-[11px] font-mono tracking-wider uppercase">
                  <th className="px-4">KEY NAME</th>
                  <th className="px-3">TARGET A VALUE</th>
                  <th className="px-3">TARGET B VALUE</th>
                  <th className="px-3">DIFF STATUS</th>
                  <th className="px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E7E4] font-mono text-[12px]">
                {loadingDiff ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#565f6b]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005459]" />
                        <span>Comparing target environment maps...</span>
                      </div>
                    </td>
                  </tr>
                ) : diffComparison.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#565f6b]">
                      No environment variables defined for comparison.
                    </td>
                  </tr>
                ) : (
                  diffComparison
                    .filter((item) => {
                      if (diffFilter === 'missing') return item.status === 'MISSING_IN_B'
                      if (diffFilter === 'mismatch') return item.status === 'MISMATCH' || item.status === 'MISSING_IN_B'
                      return true
                    })
                    .map((item) => {
                      const isMatch = item.status === 'MATCH'
                      const isMissingB = item.status === 'MISSING_IN_B'
                      const isMissingA = item.status === 'MISSING_IN_A'
                      const isMismatch = item.status === 'MISMATCH'

                      return (
                        <tr
                          key={item.key}
                          className={`hover:bg-[#F9FAF9] transition-colors ${
                            isMissingB ? 'bg-[#FFFDF5]' : isMismatch ? 'bg-[#FAF5FF]' : ''
                          }`}
                        >
                          {/* Key */}
                          <td className="px-4 py-2.5 font-bold text-[#101d26]">
                            {item.key}
                          </td>

                          {/* Target A Value */}
                          <td className="px-3 py-2.5">
                            {item.inA ? (
                              <span className="text-[#005459] bg-[#E2F0FD] px-1.5 py-0.5 rounded text-[11px] max-w-xs truncate inline-block">
                                {/PASS|KEY|SECRET|TOKEN/i.test(item.key) ? '••••••••' : item.valA || '""'}
                              </span>
                            ) : (
                              <span className="text-[#8F9CA7] italic text-[11px]">(not defined)</span>
                            )}
                          </td>

                          {/* Target B Value */}
                          <td className="px-3 py-2.5">
                            {item.inB ? (
                              <span className="text-[#101d26] bg-[#F4F6F5] px-1.5 py-0.5 rounded text-[11px] max-w-xs truncate inline-block">
                                {/PASS|KEY|SECRET|TOKEN/i.test(item.key) ? '••••••••' : item.valB || '""'}
                              </span>
                            ) : (
                              <span className="text-[#C2412D] bg-[#FAEBE9] px-1.5 py-0.5 rounded text-[11px] font-semibold">
                                MISSING IN B
                              </span>
                            )}
                          </td>

                          {/* Diff Status Pill */}
                          <td className="px-3 py-2.5">
                            {isMatch && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EAF5EE] text-[#2E8B57] text-[10px] font-bold border border-[#B8E0C5]">
                                <Check className="w-2.5 h-2.5" /> MATCH
                              </span>
                            )}
                            {isMismatch && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#6B46C1] text-[10px] font-bold border border-[#D8B4FE]">
                                VALUE DIFF
                              </span>
                            )}
                            {isMissingB && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF3E7] text-[#B87E0C] text-[10px] font-bold border border-[#F1D6A4]">
                                MISSING IN B
                              </span>
                            )}
                            {isMissingA && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E2F0FD] text-[#005459] text-[10px] font-bold border border-[#BEDDF7]">
                                EXTRA IN B
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-2.5 text-right">
                            {canManage && item.inA && (isMissingB || isMismatch) && (
                              <button
                                type="button"
                                onClick={() => handleSyncKeyToB(item.key, item.valA)}
                                className="h-[24px] px-2 rounded-[4px] bg-white border border-[#CDD4D0] hover:bg-[#005459] hover:text-white text-[#005459] text-[10px] font-semibold transition-colors cursor-pointer"
                              >
                                Sync to B
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
