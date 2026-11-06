import { useState } from 'react'
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  GitBranch,
  Rocket,
  ShieldAlert,
  Loader2,
  Layers,
  Code
} from 'lucide-react'
import { useToast } from '../context/ToastContext'

export function ChatOpsSimulatorModal({
  isOpen,
  onClose,
  project,
  target,
  webhookUrl = '',
  platform = 'slack' // 'slack' | 'teams'
}) {
  const { addToast } = useToast()
  const [activePlatform, setActivePlatform] = useState(platform)
  const [cardState, setCardState] = useState('PENDING') // 'PENDING' | 'APPROVED' | 'REJECTED'
  const [pipelineStage, setPipelineStage] = useState('CANARY') // 'BUILDING' | 'TESTING' | 'CANARY' | 'LIVE'
  const [isSendingRealWebhook, setIsSendingRealWebhook] = useState(false)
  const [showJson, setShowJson] = useState(false)

  if (!isOpen) return null

  const projectName = project?.name || 'Production App'
  const targetName = target?.name || 'Production Server 01'
  const commitSha = project?.commitSha?.slice(0, 7) || '8f3a290'
  const branchName = project?.defaultBranch || project?.branch || 'main'

  // Generate real Slack Block Kit payload
  const slackPayload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `[PortalOps] Release Approval Required: ${projectName}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Target:*\n\`${targetName}\`` },
          { type: 'mrkdwn', text: `*Environment:*\n\`PRODUCTION\`` },
          { type: 'mrkdwn', text: `*Branch:*\n\`${branchName}\`` },
          { type: 'mrkdwn', text: `*Commit SHA:*\n\`${commitSha}\`` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: cardState === 'APPROVED'
            ? '✅ *Status:* Approved by `@devops.lead` · Automated Canary Analysis Running (10% slice)'
            : cardState === 'REJECTED'
            ? '❌ *Status:* Release Rejected by Operator'
            : '⚠️ *Action Required:* Peer sign-off required before deploying to customer-facing traffic.'
        }
      },
      cardState === 'PENDING'
        ? {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Approve Release', emoji: true },
                style: 'primary',
                value: 'approve_release'
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: 'View Diff', emoji: true },
                value: 'view_diff'
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Reject', emoji: true },
                style: 'danger',
                value: 'reject_release'
              }
            ]
          }
        : {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Updated at ${new Date().toLocaleTimeString()} via PortalOps 2-Way Sync`
              }
            ]
          }
    ]
  }

  // Generate real MS Teams Adaptive Card payload
  const teamsPayload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: `[PortalOps] Release Approval: ${projectName}`
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Target Host:', value: targetName },
                { title: 'Branch:', value: branchName },
                { title: 'Commit:', value: commitSha },
                { title: 'State:', value: cardState }
              ]
            }
          ],
          actions: cardState === 'PENDING' ? [
            {
              type: 'Action.Submit',
              title: 'Approve Release',
              data: { action: 'approve' }
            },
            {
              type: 'Action.Submit',
              title: 'Reject',
              data: { action: 'reject' }
            }
          ] : []
        }
      }
    ]
  }

  const handleSimulateApprove = () => {
    setCardState('APPROVED')
    setPipelineStage('CANARY')
    addToast({
      title: 'Release Approved in ChatOps',
      desc: 'Simulated 2-way sync: Portal updated Slack card and initiated canary deploy.',
      type: 'success'
    })
  }

  const handleSimulateReject = () => {
    setCardState('REJECTED')
    addToast({
      title: 'Release Rejected',
      desc: 'Pipeline halted by ChatOps sign-off rejection.',
      type: 'info'
    })
  }

  const handleResetCard = () => {
    setCardState('PENDING')
    setPipelineStage('CANARY')
  }

  const handleSendRealWebhook = async () => {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      addToast({
        title: 'Webhook URL Missing',
        desc: 'Please enter a valid Slack or Teams Incoming Webhook URL in Settings first.',
        type: 'warning'
      })
      return
    }

    setIsSendingRealWebhook(true)
    try {
      const payload = activePlatform === 'slack' ? slackPayload : teamsPayload
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      })

      addToast({
        title: 'ChatOps Payload Dispatched',
        desc: `Interactive card posted to ${activePlatform.toUpperCase()} incoming webhook!`,
        type: 'success'
      })
    } catch (err) {
      console.error('Failed to dispatch webhook:', err)
      addToast({
        title: 'Webhook Dispatch Error',
        desc: err.message || 'Network error connecting to webhook endpoint.',
        type: 'error'
      })
    } finally {
      setIsSendingRealWebhook(false)
    }
  }

  const activeJson = activePlatform === 'slack' ? slackPayload : teamsPayload

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[620px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-[52px] px-5 border-b border-[#E2E7E4] flex items-center justify-between shrink-0 bg-[#FAFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-[#005459] text-white flex items-center justify-center font-bold text-[13px]">
              #
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-[#101d26]">
                Interactive ChatOps Simulator (Slack &amp; MS Teams)
              </h3>
              <p className="text-[11px] text-[#565f6b]">
                Real-time 2-way approval cards with interactive buttons
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] hover:bg-[#F4F6F5] text-[#565f6b] hover:text-[#101d26] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selection Ribbon */}
        <div className="px-5 py-2.5 border-b border-[#E2E7E4] bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePlatform('slack')}
              className={`h-[28px] px-3 rounded-[4px] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activePlatform === 'slack'
                  ? 'bg-[#4A154B] text-white'
                  : 'bg-[#F4F6F5] text-[#565f6b] hover:bg-[#E2E7E4]'
              }`}
            >
              <span>Slack (Block Kit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('teams')}
              className={`h-[28px] px-3 rounded-[4px] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activePlatform === 'teams'
                  ? 'bg-[#5059C9] text-white'
                  : 'bg-[#F4F6F5] text-[#565f6b] hover:bg-[#E2E7E4]'
              }`}
            >
              <span>Microsoft Teams (Adaptive Card)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="text-[11px] text-[#005459] font-mono flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJson ? 'View Visual Card' : 'View Raw JSON'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {showJson ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#565f6b]">
                <span>{activePlatform.toUpperCase()} PAYLOAD SCHEMA</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(activeJson, null, 2))
                    addToast({ title: 'JSON Copied', desc: 'Webhook payload schema copied', type: 'success' })
                  }}
                  className="hover:text-[#005459] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 bg-[#101d26] text-[#BEDAF2] font-mono text-[11px] rounded-[6px] overflow-x-auto max-h-[300px]">
                {JSON.stringify(activeJson, null, 2)}
              </pre>
            </div>
          ) : (
            <>
              {/* Visual Simulated Chat Card */}
              {activePlatform === 'slack' ? (
                <div className="border border-[#CDD4D0] rounded-[8px] bg-white p-4 shadow-xs space-y-3 font-sans">
                  {/* Slack App Identity */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[4px] bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px]">
                      PO
                    </div>
                    <span className="font-bold text-[13px] text-[#101d26]">PortalOps Bot</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 bg-[#F4F6F5] text-[#565f6b] rounded">APP</span>
                    <span className="text-[11px] text-[#8F9CA7]">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Slack Card Box with left border */}
                  <div className="pl-3.5 border-l-4 border-[#005459] space-y-3">
                    <div className="font-bold text-[14px] text-[#101d26]">
                      🚀 Release Sign-off Required: {projectName}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#FAFBFB] p-2.5 rounded border border-[#E2E7E4]">
                      <div>
                        <span className="text-[#565f6b] block text-[10px] uppercase font-bold">Target</span>
                        <span className="font-mono font-semibold text-[#101d26]">{targetName}</span>
                      </div>
                      <div>
                        <span className="text-[#565f6b] block text-[10px] uppercase font-bold">Environment</span>
                        <span className="font-mono font-bold text-[#2E8B57]">PRODUCTION</span>
                      </div>
                      <div>
                        <span className="text-[#565f6b] block text-[10px] uppercase font-bold">Branch</span>
                        <span className="font-mono text-[#101d26]">{branchName}</span>
                      </div>
                      <div>
                        <span className="text-[#565f6b] block text-[10px] uppercase font-bold">Commit SHA</span>
                        <span className="font-mono text-[#005459] font-bold">{commitSha}</span>
                      </div>
                    </div>

                    {/* Interactive State Bar */}
                    {cardState === 'APPROVED' ? (
                      <div className="p-2.5 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[4px] text-[12px] space-y-1.5">
                        <div className="font-bold text-[#2E8B57] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved by @devops.lead · Automated Canary Active</span>
                        </div>
                        <div className="w-full bg-[#B8E0C5] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#2E8B57] h-full w-[65%]" />
                        </div>
                        <div className="text-[10px] font-mono text-[#565f6b] flex justify-between">
                          <span>Progress: Canary Observation (10% slice)</span>
                          <span>65% complete</span>
                        </div>
                      </div>
                    ) : cardState === 'REJECTED' ? (
                      <div className="p-2.5 bg-[#FEF5F4] border border-[#FAD2CD] rounded-[4px] text-[12px] text-[#C2412D] font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Release Deployment Aborted by Operator</span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <p className="text-[12px] text-[#565f6b]">
                          Production requires peer sign-off. Click below to approve release directly from Slack:
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSimulateApprove}
                            className="h-[30px] px-3 bg-[#007A5A] hover:bg-[#148567] text-white text-[12px] font-bold rounded-[4px] cursor-pointer transition-colors"
                          >
                            Approve Release
                          </button>

                          <button
                            type="button"
                            onClick={handleSimulateReject}
                            className="h-[30px] px-3 bg-[#E01E5A] hover:bg-[#D01850] text-white text-[12px] font-bold rounded-[4px] cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Microsoft Teams Adaptive Card */
                <div className="border border-[#CDD4D0] rounded-[8px] bg-white p-4 shadow-xs space-y-3 font-sans">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E2E7E4]">
                    <div className="w-5 h-5 rounded bg-[#5059C9] text-white flex items-center justify-center font-bold text-[9px]">
                      T
                    </div>
                    <span className="font-bold text-[12px] text-[#101d26]">Microsoft Teams Adaptive Card</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-[15px] text-[#101d26]">
                      [PortalOps] Release Approval: {projectName}
                    </h4>

                    <div className="space-y-1 text-[12px]">
                      <div className="flex">
                        <span className="w-28 text-[#565f6b] font-medium">Target Host:</span>
                        <span className="font-mono font-semibold">{targetName}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 text-[#565f6b] font-medium">Commit:</span>
                        <span className="font-mono text-[#005459] font-bold">{commitSha}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 text-[#565f6b] font-medium">Status:</span>
                        <span className="font-bold text-[#2E8B57]">{cardState}</span>
                      </div>
                    </div>

                    {cardState === 'PENDING' ? (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleSimulateApprove}
                          className="h-[30px] px-3.5 bg-[#5059C9] text-white text-[12px] font-semibold rounded cursor-pointer hover:bg-[#434BAC]"
                        >
                          Approve Release
                        </button>
                        <button
                          type="button"
                          onClick={handleSimulateReject}
                          className="h-[30px] px-3 border border-[#CDD4D0] text-[#C2412D] text-[12px] font-semibold rounded cursor-pointer hover:bg-[#FEF5F4]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 text-[11px] text-[#565f6b] font-mono">
                        Card synced with PortalOps control plane.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reset simulation controls */}
              <div className="flex items-center justify-between text-[11px] text-[#565f6b] pt-1">
                <span>Interactive 2-Way Sync Simulator</span>
                {cardState !== 'PENDING' && (
                  <button
                    type="button"
                    onClick={handleResetCard}
                    className="text-[#005459] font-medium hover:underline cursor-pointer"
                  >
                    Reset to Pending Approval
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-[52px] px-5 border-t border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] px-3.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            disabled={isSendingRealWebhook || !webhookUrl}
            onClick={handleSendRealWebhook}
            className="h-[34px] px-4 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title={!webhookUrl ? 'Configure a Webhook URL in Settings first' : 'Send actual HTTP payload'}
          >
            {isSendingRealWebhook ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send Live Webhook to {activePlatform === 'slack' ? 'Slack' : 'Teams'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
