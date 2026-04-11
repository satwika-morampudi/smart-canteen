import { useState, useRef, useEffect } from 'react';
import CONFIG from '../config';



const AIChatbot = ({ menuItems }) => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your Smart Canteen assistant. Tell me what you're craving or any dietary preferences and I'll suggest the perfect items for you!"
    }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build menu context for Claude
      const menuContext = menuItems
        .filter(i => i.isAvailable)
        .map(i => `${i.name} (₹${i.price}, ${i.category}, ${i.prepTime} min prep)`)
        .join(', ');

      const systemPrompt = `You are a helpful canteen assistant for a college canteen in India. 
Your job is to suggest food items from the menu based on what the student wants.
Available menu items: ${menuContext}
Rules:
- Only suggest items from the menu above
- Keep responses short and friendly (2-3 lines max)
- Always mention the price
- If student mentions diet (diabetic, vegan, etc.) filter accordingly
- End with a question to help them decide`;

    //   const response = await fetch('https://api.anthropic.com/v1/messages', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'x-api-key': CLAUDE_API_KEY,
    //       'anthropic-version': '2023-06-01',
    //       'anthropic-dangerous-direct-browser-access': 'true'
    //     },
    //     body: JSON.stringify({
    //       model: 'claude-haiku-4-5-20251001',
    //       max_tokens: 300,
    //       system: systemPrompt,
    //       messages: updatedMessages.filter(m => m.role !== 'system')
    //     })
    //   });

  const response = await fetch(`${CONFIG.API_URL.replace('/api', '')}/api/auth/ai-chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: updatedMessages.filter(m => m.role !== 'system'),
    systemPrompt
  })
});
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Try again!";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition z-50 flex items-center justify-center text-2xl"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-orange-100"
          style={{ height: '420px' }}>

          {/* Header */}
          <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <p className="font-bold text-sm">Canteen AI Assistant</p>
              <p className="text-orange-100 text-xs">Powered by Claude AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm
                  ${msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                  <span className="text-gray-400 text-sm animate-pulse">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t">
            {['Something spicy 🌶️', 'Under ₹30', 'Quick snack ⚡', 'I am diabetic'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => { setInput(suggestion); }}
                className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full whitespace-nowrap hover:bg-orange-100 transition border border-orange-200"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-orange-500 text-white px-3 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;