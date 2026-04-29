'use client';

import Link from 'next/link';
import { useState } from 'react';

const modules = {
  productGenerator: {
    title: 'Product Generator',
    subtitle: 'Generate descriptions, selling points, and SEO keywords quickly.',
  },
  emailWriter: {
    title: 'Email Writer',
    subtitle: 'Create polished business emails for sales and supplier conversations.',
  },
  captionGenerator: {
    title: 'Caption Generator',
    subtitle: 'Craft social captions and hashtags for new product launches.',
  },
  textSummarizer: {
    title: 'Text Summarizer',
    subtitle: 'Turn long text into a short structured summary.',
  },
  customerReplyGenerator: {
    title: 'Customer Reply Generator',
    subtitle: 'Draft professional customer support responses.',
  },
};

const descriptions = {
  productGenerator:
    'Need quick product marketing packages? Generate polished content for descriptions, benefits, target audiences, and SEO with AI.',
  emailWriter:
    'Write clear and professional emails instantly for orders, supplier requests, follow-ups, and sales outreach.',
  captionGenerator:
    'Create social media captions with a strong brand tone and relevant hashtags for Makro Food campaigns.',
  textSummarizer:
    'Summarize long briefs, invoices, or notes into concise business-ready content for faster review.',
  customerReplyGenerator:
    'Prepare empathetic customer responses with a friendly, professional voice for support situations.',
};

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLiveResponse = async (prompt) => {
    setLoading(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional business assistant for Makro Food. Produce clear, concise, and business-ready messages, emails, or summaries with a professional wholesale tone.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 650,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }

      const message = data.choices?.[0]?.message?.content;
      setOutput(message || 'No response returned from OpenAI.');
    } catch (error) {
      setOutput(`OpenAI request failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (input.trim()) {
      generateLiveResponse(input);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleExamplePrompt = (prompt) => {
    setInput(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <main className="app-shell home-page">
      <section className="ai-assistant-box">
        <div className="assistant-header">
          <div>
            <h2 className="assistant-title">Makro AI Assistant</h2>
            <p className="assistant-subtitle">Ask anything — generate copy, write emails, summarize invoices, or get business insights.</p>
          </div>
        </div>

        <div className="assistant-input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Makro AI anything... (write email, generate product description, summarize invoice, etc.)"
            className="assistant-textarea"
            disabled={loading}
          />

          <div className="assistant-controls">
            <div className="control-buttons">
              <button
                onClick={handleGenerate}
                disabled={!input.trim() || loading}
                className="button button-primary"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={handleClear}
                disabled={!input && !output}
                className="button button-secondary"
              >
                Clear
              </button>
            </div>

            <div className="template-prompts">
              <span className="prompts-label">Quick templates:</span>
              <button
                type="button"
                onClick={() => handleExamplePrompt('Write a professional email to a supplier about a bulk fresh produce order.')}
                className="prompt-chip"
              >
                Write supplier email
              </button>
              <button
                type="button"
                onClick={() => handleExamplePrompt('Summarize the following invoice details into a brief business report.')}
                className="prompt-chip"
              >
                Summarize invoice
              </button>
              <button
                type="button"
                onClick={() => handleExamplePrompt('Generate a professional product description for organic fresh tomatoes as a wholesale item.')}
                className="prompt-chip"
              >
                Product description
              </button>
            </div>
            <div className="assistant-summary">
              <strong>Tip:</strong> start with your task, then add the product or invoice details. Use prompts like “Create…” or “Summarize…” for the best AI output.
            </div>
          </div>
        </div>

        {loading && (
          <div className="assistant-loading">
            <div className="loading-spinner" />
            <span>Generating response...</span>
          </div>
        )}

        {output && (
          <div className="assistant-output">
            <div className="output-header">
              <h3>AI Response</h3>
              <button onClick={copyToClipboard} className="copy-button" title="Copy to clipboard">
                Copy
              </button>
            </div>
            <pre className="output-text">{output}</pre>
          </div>
        )}
      </section>
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Makro AI Assistant</span>
          <h1>Plans that grow with you</h1>
          <p>
            Makro Food’s AI dashboard for content, communication, and invoice workflows — now with a separate Advanced Mode for packing slip automation.
          </p>
          <div className="hero-actions">
            <Link href="/upload" className="button button-primary">
              Upload Invoice
            </Link>
            <Link href="/workflow" className="button button-secondary">
              Workflow Board
            </Link>
            <Link href="/advanced" className="button button-tertiary">
              Advanced Mode
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="tab-toggle">
            <button className="tab active">Individual</button>
            <button className="tab">Team and Enterprise</button>
          </div>
          <div className="pricing-card">
            <p className="pricing-label">Starter</p>
            <h2 className="pricing-value">Makro Essentials</h2>
            <p className="pricing-text">Access marketing, sales, and support AI workflows with secure OpenAI integration.</p>
            <ul>
              <li>Product content generation</li>
              <li>Email and caption writing</li>
              <li>Customer reply and summary tools</li>
            </ul>
          </div>
        </div>
      </header>

      <section id="modules" className="grid modules-grid">
        {Object.entries(modules).map(([key, module]) => (
          <article className="card module-card" key={key}>
            <h2>{module.title}</h2>
            <p>{module.subtitle}</p>
            <p className="module-description">{descriptions[key]}</p>
          </article>
        ))}
      </section>

      <section className="notes">
        <h3>Build smarter with Makro AI</h3>
        <ul>
          <li>Use specialized AI tools for marketing, sales, support, and operations.</li>
          <li>Switch to Advanced Mode for invoice upload, extraction, and packing slip generation.</li>
          <li>Keep pricing out of delivery documents and streamline internal communication.</li>
        </ul>
      </section>
    </main>
  );
}
