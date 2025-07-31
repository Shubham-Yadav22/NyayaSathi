import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const scriptPath = path.resolve(process.cwd(), "backend/query_vector_db.py")

  return new Promise((resolve, _reject) => {
    const process = spawn("python", [scriptPath, message])

    let result = ""
    let errorOutput = ""

    process.stdout.on("data", (data) => {
      result += data.toString()
    })

    process.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    process.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ Python Error:", errorOutput)
        return resolve(NextResponse.json({ reply: `⚠️ Python error:\n${errorOutput}` }))
      }

      return resolve(NextResponse.json({ reply: result.trim() }))
    })
  })
}
