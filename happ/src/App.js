import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, BookOpen, Star, CheckCircle, Award } from 'lucide-react';
import './App.css';

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "AIzaSyA6206mZepQktTDaSI_x6-Y1LNvy9cqKHs";

const EDUCATION_KEYWORDS = [
  // Core Learning
  'learn', 'study', 'understand', 'explain', 'concept', 'topic', 'subject',
  'homework', 'assignment', 'project', 'research', 'practice', 'exercise',
  
  // Subjects (expanded)
  'math', 'mathematics', 'algebra', 'calculus', 'geometry', 'trigonometry',
  'physics', 'chemistry', 'biology', 'science', 'history', 'geography',
  'english', 'hindi', 'sanskrit', 'computer', 'programming', 'economics',
  'literature', 'language', 'social', 'civics', 'environment', 'statistics',
  'probability', 'data science', 'machine learning', 'artificial intelligence',
  'robotics', 'electronics', 'mechanical engineering', 'civil engineering',
  'electrical engineering', 'biotechnology', 'genetics', 'astrophysics',
  'quantum mechanics', 'environmental science', 'geology', 'meteorology',
  'oceanography', 'astronomy', 'history of art', 'music theory', 'drama',
  'psychology', 'philosophy', 'sociology', 'anthropology', 'political science',
  'archaeology', 'linguistics', 'neuroscience', 'microbiology', 'organic chemistry',
  'inorganic chemistry', 'physical chemistry', 'computer science', 'cybersecurity',
  'cloud computing', 'web development', 'mobile app development', 'software engineering',
  'game design', 'graphic design', 'business studies', 'accounting', 'finance', 
  'entrepreneurship', 'marketing', 'management studies', 'international relations',
  'public administration', 'law', 'criminology', 'nursing', 'medicine', 'pharmacology',
  'veterinary science', 'nutrition', 'public health', 'physical education', 'sports science',
  'theology', 'ethics', 'urban studies', 'demography', 'rural development', 'agriculture',
  'horticulture', 'forestry', 'zoology', 'paleontology', 'marine biology', 'architecture',
  'design thinking', 'fashion design', 'interior design', 'film studies', 'media studies',
  'journalism', 'broadcasting', 'photography', 'animation', 'performing arts',
  
  // Academic Terms
  'formula', 'equation', 'theory', 'principle', 'law', 'theorem', 'proof',
  'problem', 'solution', 'example', 'definition', 'meaning', 'concept',
  
  // Study Skills
  'focus', 'concentrate', 'memorize', 'remember', 'revise', 'review', 'prepare',
  'notes', 'summary', 'outline', 'diagram', 'mindmap', 'flashcard',
  'strategy', 'technique', 'method', 'approach', 'system', 'organize',
  
  // Exam Related
  'exam', 'test', 'quiz', 'assessment', 'score', 'grade', 'performance',
  'jee', 'neet', 'upsc', 'cbse', 'icse', 'board', 'competitive', 'entrance',
  
  // Help Words
  'help', 'guide', 'assist', 'support', 'advice', 'suggest', 'recommend',
  'explain', 'clarify', 'doubt', 'question', 'confused', 'stuck', 'difficult',
  
  // Planning
  'plan', 'schedule', 'timetable', 'routine', 'management', 'organize',
  'goal', 'target', 'objective', 'achieve', 'improve', 'progress',
  'aspire', 'ambition', 'aim', 'purpose', 'vision', 'intention', 'mission',
  'milestone', 'success', 'growth', 'development', 'reach', 'fulfill',
  'accomplish', 'attain', 'advance', 'elevate', 'expand', 'enhance', 'evolve',
  'upgrade', 'optimize', 'strive', 'pursue', 'complete', 'execute', 'focus',
  'drive', 'dedication', 'commit', 'reach', 'outperform', 'breakthrough',
  'lead', 'excel', 'step-up', 'succeed', 'push forward'
];


export default function App() {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const isEducationRelated = (text) => {
    const lowercaseText = text.toLowerCase();
    return EDUCATION_KEYWORDS.some(keyword => 
      lowercaseText.includes(keyword.toLowerCase())
    );
  };

  const generateStructuredPrompt = (userInput) => {
    const userQuery = userInput.toLowerCase();
    let specificPrompt = "";

    if (userQuery.includes('explain') || userQuery.includes('what is') || userQuery.includes('tell me about')) {
      specificPrompt = `
      Format your response as an interactive flashcard:
      
      🎯 TOPIC OVERVIEW
      • Start with a brief, engaging definition
      • Break complex ideas into bullet points
      • Use emojis for key sections
      
      📚 KEY POINTS
      • List 3-4 main concepts
      • Use clear, simple language
      • Add relevant examples
      
      💡 REMEMBER
      • Include memorable facts
      • Add mnemonics if applicable
      • Highlight important terms
      
      ✨ QUICK TIPS
      • Study strategies
      • Common mistakes to avoid
      • Practice suggestions
      `;
    } else if (userQuery.includes('how to') || userQuery.includes('steps') || userQuery.includes('process')) {
      specificPrompt = `
      Format your response as a step-by-step guide:
      
      🎯 OBJECTIVE
      • Clear goal statement
      • Expected outcome
      • Prerequisites if any
      
      📝 STEP-BY-STEP PROCESS
      • Number each step clearly
      • Explain the reasoning
      • Add tips for each step
      
      ⚡ PRO TIPS
      • Expert suggestions
      • Common pitfalls
      • Efficiency tricks
      
      ✅ SUCCESS CHECKLIST
      • Verification points
      • Practice exercises
      • Next steps
      `;
    } else {
      specificPrompt = `
      Format your response in an engaging way:
      
      📚 MAIN CONTENT
      • Clear explanation
      • Key points highlighted
      • Relevant examples
      
      💡 IMPORTANT NOTES
      • Critical information
      • Special considerations
      • Common misconceptions
      
      ✨ PRACTICAL APPLICATION
      • Real-world examples
      • Practice suggestions
      • Further exploration
      `;
    }

    return `You are an expert educational AI tutor. Format your response to be visually engaging and easy to follow.

${specificPrompt}

Use emojis and clear formatting to make the response visually appealing and easy to understand.
Make sure to separate different sections clearly.
Include relevant examples from Indian education context when applicable.

Query to address: ${userInput}`;
  };

  const chatWithGemini = async (userInput) => {
    if (!isEducationRelated(userInput)) {
      return `✨ Hello! I'm your dedicated educational assistant!

📚 I can help you with:
• Subject-specific concepts and problems
• Study techniques and planning
• Exam preparation strategies
• Time management and focus
• Academic resources and guidance

🔍 Try asking me:
• "Explain photosynthesis with examples"
• "How to solve quadratic equations?"
• "Create a study plan for JEE"
• "Tips for better concentration"

Let's make learning fun and effective! 🌟`;
    }

    const prompt = generateStructuredPrompt(userInput);
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setConversation(prev => [...prev, { role: "user", content: userInput }]);
    setUserInput("");

    try {
      const response = await chatWithGemini(userInput);
      setConversation(prev => [...prev, { role: "bot", content: response }]);
    } catch (error) {
      console.error("Error:", error);
      setConversation(prev => [
        ...prev, 
        { role: "bot", content: "🤔 I apologize, but I'm having trouble connecting. Please try again." }
      ]);
    }

    setIsLoading(false);
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!atBottom);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
      return () => messagesContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="app-container">
      <div className="chat-area">
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-icon">
              <BookOpen size={32} />
            </div>
            <h1>SmartEduBot</h1>
            <p className="header-subtitle">Your Interactive Learning Companion</p>
          </div>

          <div className="chat-content">
            <div 
              className="messages-container" 
              ref={messagesContainerRef}
              style={{ position: 'relative' }}
            >
              {conversation.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-icon">
                    <Star size={40} className="star-icon" />
                  </div>
                  <h2>Welcome to Your Learning Journey! ✨</h2>
                  <p>I'm here to make your education journey exciting and effective!</p>
                  <div className="feature-cards">
                    <div className="feature-card">
                      <BookOpen size={24} />
                      <h3>Subject Help</h3>
                      <p>Get clear explanations for any topic</p>
                    </div>
                    <div className="feature-card">
                      <CheckCircle size={24} />
                      <h3>Exam Prep</h3>
                      <p>Strategic guidance for better results</p>
                    </div>
                    <div className="feature-card">
                      <Award size={24} />
                      <h3>Study Tips</h3>
                      <p>Learn smarter, not harder</p>
                    </div>
                  </div>
                </div>
              )}
              {conversation.map((message, index) => (
                <div key={index} className={`message ${message.role} ${message.role === 'bot' ? 'flashcard-style' : ''}`}>
                  <div className="message-content">
                    <div className="message-icon">
                      {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className="message-text">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="scroll-button"
                  aria-label="Scroll to bottom"
                >
                  ↓
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask any question about your studies..."
                className="input-field"
              />
              <button type="submit" className="send-button" disabled={isLoading}>
                <Send size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
