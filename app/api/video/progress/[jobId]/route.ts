import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo purposes
// In production, use Redis or a database
const processingJobs = new Map<string, {
  status: 'processing' | 'completed' | 'error'
  progress: number
  outputUrl?: string
  error?: string
}>()

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    
    const job = processingJobs.get(jobId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)

  } catch (error) {
    console.error('Progress check error:', error)
    return NextResponse.json(
      { error: 'Failed to check progress' },
      { status: 500 }
    )
  }
}

// Helper function to update job progress (would be called by processing service)
export function updateJobProgress(
  jobId: string, 
  progress: number, 
  status: 'processing' | 'completed' | 'error',
  outputUrl?: string,
  error?: string
) {
  processingJobs.set(jobId, {
    status,
    progress,
    outputUrl,
    error
  })
}
