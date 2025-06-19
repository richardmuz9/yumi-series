import React, { useState, useRef, useEffect } from 'react'
import './SpeechToText.css'
import speechData from '../data/speechRecognitionData.json'

interface SpeechToTextProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  language?: string
  placeholder?: string
  showLanguageSelector?: boolean
  continuous?: boolean
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  onTranscript,
  onError,
  language = 'en-US',
  placeholder = "Click the microphone to start speaking...",
  showLanguageSelector = true,
  continuous = false
}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [useServerSTT, setUseServerSTT] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const languages = speechData.languages.map(lang => ({
    code: lang.code,
    name: `${lang.flag} ${lang.name}`
  }))

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setUseServerSTT(true)
      console.log('Browser Speech Recognition not supported, using server STT')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startBrowserSTT = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = selectedLanguage

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        const newTranscript = transcript + finalTranscript
        setTranscript(newTranscript)
        onTranscript(newTranscript)
      }
      setInterimTranscript(interimTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
      if (onError) {
        onError(event.error)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const startServerSTT = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }
      updateAudioLevel()

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        setAudioLevel(0)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
    } catch (error) {
      setError('Failed to access microphone')
      console.error('Microphone access error:', error)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', selectedLanguage)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const result = await response.json()
      const newTranscript = transcript + (result.text || '')
      setTranscript(newTranscript)
      onTranscript(newTranscript)
    } catch (error) {
      setError('Failed to transcribe audio')
      console.error('Transcription error:', error)
    }
  }

  const startListening = () => {
    if (useServerSTT) {
      startServerSTT()
    } else {
      startBrowserSTT()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsListening(false)
    setIsRecording(false)
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    onTranscript('')
  }

  const toggleSTTMethod = () => {
    if (isListening || isRecording) {
      stopListening()
    }
    setUseServerSTT(!useServerSTT)
  }

  return (
    <div className="speech-to-text-container">
      <div className="stt-header">
        <h4>🎤 Speech to Text</h4>
        <div className="stt-controls">
          {showLanguageSelector && (
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="language-selector"
              disabled={isListening || isRecording}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}
          
          <button
            className="stt-method-toggle"
            onClick={toggleSTTMethod}
            title={`Switch to ${useServerSTT ? 'Browser' : 'Server'} STT`}
            disabled={isListening || isRecording}
          >
            {useServerSTT ? '🌐 Server' : '🔍 Browser'}
          </button>
        </div>
      </div>

      <div className="stt-main">
        <div className="microphone-container">
          <button
            className={`microphone-btn ${isListening || isRecording ? 'active' : ''}`}
            onClick={isListening || isRecording ? stopListening : startListening}
            disabled={!!error}
          >
            <div className="mic-icon">
              {isListening || isRecording ? '🔴' : '🎤'}
            </div>
            {(isListening || isRecording) && (
              <div 
                className="audio-level-indicator"
                style={{ 
                  transform: `scale(${1 + audioLevel * 0.5})`,
                  opacity: 0.7 + audioLevel * 0.3
                }}
              />
            )}
          </button>
          
          <div className="mic-status">
            {isListening && 'Listening...'}
            {isRecording && 'Recording...'}
            {!isListening && !isRecording && 'Click to start'}
          </div>
        </div>

        <div className="transcript-container">
          <div className="transcript-text">
            {transcript && (
              <div className="final-transcript">
                {transcript}
              </div>
            )}
            {interimTranscript && (
              <div className="interim-transcript">
                {interimTranscript}
              </div>
            )}
            {!transcript && !interimTranscript && (
              <div className="transcript-placeholder">
                {placeholder}
              </div>
            )}
          </div>
          
          {transcript && (
            <button
              className="clear-btn"
              onClick={clearTranscript}
              title="Clear transcript"
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="stt-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="stt-info">
        <p>
          💡 <strong>Tip:</strong> {useServerSTT ? 
            'Server STT provides better accuracy for multiple languages' : 
            'Browser STT works offline but may have limited language support'
          }
        </p>
      </div>
    </div>
  )
}

export default SpeechToText 