import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] shadow-xs">
          <div className="flex items-center gap-3 text-[#BA1A1A] mb-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-[15px] font-bold text-[#101d26]">Something went wrong loading this view</h2>
          </div>
          <p className="text-[12px] text-[#565f6b] mb-4 font-mono bg-[#F4F6F5] p-3 rounded border border-[#E2E7E4]">
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-3 py-1.5 bg-[#005459] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#084246] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload View
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/dashboard'
              }}
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#CDD4D0] text-[#101d26] text-[12px] font-medium rounded-[6px] hover:bg-[#F4F6F5] transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
