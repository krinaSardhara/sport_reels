import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - Video Generator",
  description: "Project documentation and structure overview",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Project Documentation</h1>
      
      {/* Project Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <p className="text-muted-foreground mb-4">
            Sports Reels is uses AI to create engaging video content about sports legends. 
        </p>
      </section>

      {/* Folder Structure */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Folder Structure</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
{`/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── create/            # Video creation page
│   ├── reels/             # Reels management 
│   ├── types/             # TypeScript type definitions
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── [config files]        # Various configuration files`}
          </pre>
        </div>
      </section>

      {/* Project Flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Project Flow</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">1. Video Creation Process</h3>
              <ul className="text-gray-600 dark:text-gray-300">
              <li>AI processes your input and generates engaging reels content</li>
              <li>I used Google's Gemini 2.0 Flash model (because free access is always nice! 🙈)  through Vercel AI SDK along with the exa-js research agent</li>
              <li>For text-to-speech, I integrated Amazon Polly</li>
              <li>I combined the video and audio using FFmpeg (again choosing the free option for basic video editing)</li>
              <li>The final video is stored securely in S3 and is ready for you to view</li>       </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">2. Reels Management</h3>
              <ul className="text-gray-600 dark:text-gray-300">
                <li>Responsive TikTok-style grid layout with infinite scroll</li>
                <li>Auto-play videos on scroll with lazy loading for optimal performance</li>
                <li>Interactive video controls with play/pause and volume toggle</li>
                <li>Mobile resposive design with smooth transitions and animations</li>
              </ul>
          </div>
        </div>
      </section>

      {/* Packages Used */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Key Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Core Dependencies</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>Next.js</li>
              <li>React</li>
              <li>TypeScript</li>
              <li>TailwindCSS</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Video Processing</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>@ffmpeg/ffmpeg</li>
              <li>@ffmpeg/util</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">AI Integration</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>@ai-sdk/google</li>
              <li>AI SDK</li>
              <li>exa-js</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">UI Components</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>@radix-ui/react-*</li>
              <li>framer-motion</li>
              <li>lucide-react</li>
            </ul>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Video Reels Create</h3>
            <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
{`
POST /api/generate
Content-Type: application/json

Request Body:
{
  athleteName:string
}

Response:
{
  "description": string,
  "imageUrls": string[],
  audioBufferData: { data: ArrayBuffer | ArrayLike<number> }
}`
// Now this reponse imageUrls and audioBufferData combine video using ffmpeg and than final save video to s3
}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Video Reels Save</h3>
            <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
{`
POST /api/save
Content-Type: application/json

Request Body:
{
  videoData: base64Video,
  contentType: 'video/mp4',
  metadata
}

Response:
{
  athletePath,
  metadata,
  videoUrl
}
`
// Now this reponse imageUrls and audioBufferData combine video using ffmpeg and than final save video to s3
}
            </pre>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Video Reels Get</h3>
            <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
{`
GET /api/reels?limit=perPageCount&page=pageNumber

Response: {
  videoUrl: string;
  metadata: ReelMetadata;
}
  `}
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
