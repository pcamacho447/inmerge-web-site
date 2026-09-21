import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { waLink } from '../data/content';

export default function LLMAssistantModal({ isOpen, onClose, initialContext = null }) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Suggested Prompts
  const suggestions = isEn
    ? [
        'How can I contact your engineering team directly?',
        'What are the typical sprint timelines and costs?',
        'How does Inmerge audit an 18M row database?',
        'What is your AWS cloud architecture & software stack?',
        'Do you sign mutual NDAs for sensitive enterprise data?',
      ]
    : [
        '¿Cómo puedo contactar directamente con un ingeniero?',
        '¿Cuáles son los tiempos y costos típicos de un sprint?',
        '¿Cómo auditan y sanean una base de datos de 18M filas?',
        '¿Cuál es su stack en desarrollo de software y AWS?',
        '¿Firman acuerdos de confidencialidad (NDA) antes de auditar?',
      ];

  // Initialize greeting on open
  useEffect(() => {
    if (isOpen) {
      const initialGreeting = initialContext
        ? isEn
          ? `Hello! I am Alaec. I see you are looking into "${initialContext.pillarName || initialContext.title?.en || 'a project'}". I can clarify our technical architecture, deliverable milestones, sprint costs, or provide our direct contact channels. How can I help you?`
          : `¡Hola! Soy Alaec. Veo que estás consultando sobre "${initialContext.pillarName || initialContext.title?.es || 'un proyecto'}". Puedo detallarte la arquitectura técnica, los entregables auditables, tiempos/costos o brindarte nuestros canales directos de contacto. ¿Qué duda técnica tienes?`
        : isEn
          ? 'Hello! I am Alaec, the Inmerge Engineering Assistant. Ask me about our 3 pillars (Technical Audit, AWS Cloud Dev, Data Science & AI), rapid sprint pricing, or direct contact channels.'
          : '¡Hola! Soy Alaec, el Asistente Técnico de Inmerge. Pregúntame sobre nuestros 3 pilares (Auditoría Técnica, Desarrollo Cloud en AWS, Ciencia de Datos e IA), cotizaciones rápidas o canales directos de contacto.';

      setMessages([{ id: 1, role: 'assistant', text: initialGreeting }]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialContext, isEn]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (typeof chatBottomRef.current?.scrollIntoView === 'function') {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate specialized context-aware responses
  const getSimulatedResponse = (query) => {
    const q = query.toLowerCase();

    // Contact and Support queries
    if (
      q.includes('contact') ||
      q.includes('telefono') ||
      q.includes('teléfono') ||
      q.includes('whatsapp') ||
      q.includes('correo') ||
      q.includes('email') ||
      q.includes('mail') ||
      q.includes('donde') ||
      q.includes('dónde') ||
      q.includes('ubicacion') ||
      q.includes('ubicación') ||
      q.includes('sede') ||
      q.includes('phone') ||
      q.includes('address') ||
      q.includes('oficina')
    ) {
      return isEn
        ? 'You can reach our senior engineering team directly through multiple channels:\n\n• WhatsApp Direct: +51 957 251 279 (instant response for technical inquiries)\n• Official Email: contacto@inmerge.pe\n• Headquarters: Lima, Peru (servicing regional and global enterprise clients)\n• Technical Scope & TDR Form: Available at inmerge.pe/en/contact\n• Direct Client Portal: inmerge.pe/en/login\n\nWould you like to speak directly with an architect via WhatsApp right now?'
        : 'Puedes contactar directamente con nuestro equipo de ingeniería senior por los siguientes canales oficiales:\n\n• WhatsApp Directo: +51 957 251 279 (respuesta ágil para consultas técnicas)\n• Correo Institucional: contacto@inmerge.pe\n• Sede Principal: Lima, Perú (operación remota para clientes locales e internacionales)\n• Formulario Oficial de TDR: inmerge.pe/contacto\n• Portal de Clientes: inmerge.pe/login\n\n¿Deseas que coordinemos una llamada técnica con nuestro Arquitecto Líder por WhatsApp?';
    }

    // NDA and Security
    if (
      q.includes('nda') ||
      q.includes('confidencial') ||
      q.includes('seguridad') ||
      q.includes('privacidad') ||
      q.includes('privacy') ||
      q.includes('security') ||
      q.includes('propiedad') ||
      q.includes('ip')
    ) {
      return isEn
        ? 'Strict confidentiality is foundational to Inmerge. We execute mutual Non-Disclosure Agreements (NDAs) prior to inspecting any codebase, database, or cloud infrastructure. All intellectual property, source code, and migration scripts belong 100% to your organization, with zero vendor lock-in.'
        : 'La confidencialidad es un principio no negociable en Inmerge. Firmamos acuerdos de confidencialidad mutua (NDA) antes de cualquier inspección de código, base de datos o arquitectura cloud. Todo el código fuente, scripts forenses y propiedad intelectual se transfieren al 100% a tu empresa sin dependencias.';
    }

    // Cloud and Software Dev
    if (
      q.includes('desarrollo') ||
      q.includes('cloud') ||
      q.includes('aws') ||
      q.includes('microservicio') ||
      q.includes('api') ||
      q.includes('arquitectura') ||
      q.includes('software') ||
      q.includes('stack')
    ) {
      return isEn
        ? 'In Pillar 02 (Cloud Development & Architecture), we design and build resilient microservices and bespoke web applications on AWS (ECS Fargate, Lambda, RDS PostgreSQL, SQS, S3). We write clean, tested code in React, Node.js, Go, and Python, delivering production-ready platforms in agile 1-to-2 week sprints.'
        : 'En el Pilar 02 (Desarrollo Tecnológico & Cloud), diseñamos y construimos microservicios y aplicaciones web a medida sobre AWS (ECS Fargate, Lambda, RDS PostgreSQL, SQS, S3). Trabajamos con código limpio y probado en React, Node.js, Go y Python, desplegando plataformas en sprints ágiles de 1 a 2 semanas.';
    }

    // Technical Audit & Data Quality
    if (
      q.includes('auditor') ||
      q.includes('base de datos') ||
      q.includes('database') ||
      q.includes('saneam') ||
      q.includes('sql') ||
      q.includes('postgres') ||
      q.includes('calidad') ||
      q.includes('duplicado')
    ) {
      return isEn
        ? 'In Pillar 01 (Technical & Data Audit), we run automated and forensic scripts in SQL/Python to inspect constraints, duplicate records, query plans, and AWS RDS configs. Typical sprints take 5 to 10 business days, delivering an executive diagnostic, full sanitization with zero data loss, and regression test suites.'
        : 'En el Pilar 01 (Auditoría Técnica y de Datos), ejecutamos análisis forenses automatizados en SQL/Python para detectar duplicados, evaluar constraints, índices y seguridad en AWS RDS/PostgreSQL. Un sprint típico toma de 5 a 10 días hábiles con entrega de diagnóstico ejecutivo, saneamiento con cero pérdida de datos y pruebas de no-regresión.';
    }

    // Data Science & AI
    if (
      q.includes('rag') ||
      q.includes('ia') ||
      q.includes('ai') ||
      q.includes('modelo') ||
      q.includes('forecast') ||
      q.includes('predict') ||
      q.includes('machine learning') ||
      q.includes('dashboard')
    ) {
      return isEn
        ? 'In Pillar 03 (Data Science & AI), we build enterprise RAG pipelines using pgvector embeddings and Gemini models with strict source citation layers to eliminate hallucinations. We also deploy time-series forecasting models (LightGBM/Python) with realtime executive dashboards in 1 to 2 weeks.'
        : 'En el Pilar 03 (Ciencia de Datos & IA), construimos pipelines RAG empresariales con embeddings en pgvector y modelos Gemini con citas auditables que eliminan alucinaciones. También desarrollamos modelos predictivos de series temporales (LightGBM/Python) con dashboards en tiempo real en sprints de 1 a 2 semanas.';
    }

    // Pricing and Timeline
    if (
      q.includes('precio') ||
      q.includes('cost') ||
      q.includes('cuanto') ||
      q.includes('cuánto') ||
      q.includes('sprint') ||
      q.includes('tiempo') ||
      q.includes('time') ||
      q.includes('tarifa') ||
      q.includes('rate')
    ) {
      return isEn
        ? 'Unlike traditional consultancies, Inmerge delivers in fast, fixed sprints (1 to 2 weeks). Diagnostics start at S/ 2,800 (~$750 USD) and standard enterprise sprints range from S/ 4,800 to S/ 13,000 (~$1,300 - $3,500 USD), with direct senior engineer access and zero overhead.'
        : 'A diferencia de las Big 4 y consultoras lentas, en Inmerge trabajamos en sprints cerrados de 1 a 2 semanas. Diagnósticos rápidos parten desde S/ 2,800 (~$750 USD) y proyectos estándar de S/ 4,800 a S/ 13,000 (~$1,300 - $3,500 USD), con trato directo con ingenieros senior y entregables auditables.';
    }

    // Invoicing and Payments
    if (
      q.includes('pago') ||
      q.includes('transfer') ||
      q.includes('banco') ||
      q.includes('cuenta') ||
      q.includes('invoice') ||
      q.includes('factur') ||
      q.includes('ruc') ||
      q.includes('tax')
    ) {
      return isEn
        ? 'We operate exclusively via Direct Bank Transfers (BCP, Interbank, BBVA in PEN for Peruvian clients, and SWIFT/Tax ID invoicing for international clients). Each order receives a unique reference code (INM-ORD-...) and is verified with forensic auditability.'
        : 'Aceptamos única y exclusivamente Transferencias Bancarias Directas (BCP, Interbank, BBVA en soles para Perú, y SWIFT con Tax ID para clientes internacionales). Cada orden cuenta con código correlativo único (INM-ORD-...) y trazabilidad bancaria auditada.';
    }

    return isEn
      ? 'Inmerge specializes in high-caliber software engineering, technical audits, and practical AI. We operate with senior engineers, auditable deliverables, and rapid 1-2 week sprints. Would you like to confirm scope or schedule a 1-on-1 technical call with our Lead Architect?'
      : 'Inmerge es una firma boutique de ingeniería de software, auditoría de datos e IA aplicada. Operamos con ingenieros senior en sprints rápidos de 1 a 2 semanas. ¿Deseas coordinar una llamada técnica con nuestro Arquitecto Líder?';
  };

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim() || isStreaming) return;

    const userMsg = { id: Date.now(), role: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsStreaming(true);

    const fullResponse = getSimulatedResponse(textToSend);
    let currentIdx = 0;
    const botMsgId = Date.now() + 1;

    setMessages((prev) => [...prev, { id: botMsgId, role: 'assistant', text: '' }]);

    const interval = setInterval(() => {
      currentIdx += 4;
      if (currentIdx >= fullResponse.length) {
        setMessages((prev) => prev.map((msg) => (msg.id === botMsgId ? { ...msg, text: fullResponse } : msg)));
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setMessages((prev) => prev.map((msg) => (msg.id === botMsgId ? { ...msg, text: fullResponse.slice(0, currentIdx) } : msg)));
      }
    }, 20);
  };

  const handleSuggestionClick = (sug) => {
    handleSendMessage(sug);
  };

  const getWhatsAppHandoffMsg = () => {
    const lastUserQuery = [...messages].reverse().find((m) => m.role === 'user')?.text || 'Consulta técnica';
    return isEn
      ? `Hello Inmerge, I was consulting with Alaec on your website about: "${lastUserQuery}". I would like to speak directly with an engineer.`
      : `Hola Inmerge, estuve conversando con Alaec en la web sobre: "${lastUserQuery}". Deseo hablar directamente con un ingeniero.`;
  };

  return (
    <div className="llm-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="llm-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="llm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="llm-modal-header">
          <div className="llm-modal-header-titles">
            <span className="alaec-status-dot" aria-hidden="true" />
            <h2 id="llm-modal-title" className="llm-title">
              Alaec <span className="llm-title-tag">{isEn ? 'AI Assistant' : 'Asistente IA'}</span>
            </h2>
          </div>
          <button
            type="button"
            className="llm-close-btn"
            onClick={onClose}
            aria-label={isEn ? 'Close Alaec assistant' : 'Cerrar asistente Alaec'}
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="llm-chat-body" tabIndex={0} aria-label={isEn ? 'Chat history' : 'Historial de conversación'}>
          {messages.map((m) => (
            <div key={m.id} className={`llm-msg-bubble ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
              <span className="msg-sender-tag">{m.role === 'user' ? (isEn ? 'You' : 'Tú') : 'Alaec'}</span>
              <p className="msg-text">{m.text}</p>
            </div>
          ))}
          {isStreaming && (
            <div className="llm-typing-indicator" aria-label={isEn ? 'Typing...' : 'Escribiendo...'}>
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="llm-suggestions-row" aria-label={isEn ? 'Suggested questions' : 'Preguntas sugeridas'}>
            {suggestions.map((sug, idx) => (
              <button key={idx} type="button" className="llm-sug-chip" onClick={() => handleSuggestionClick(sug)}>
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          className="llm-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="llm-input-field"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isEn ? 'Ask a technical or pricing question...' : 'Escribe una pregunta sobre arquitectura, tiempos o costos...'}
            disabled={isStreaming}
          />
          <button
            type="submit"
            className="llm-send-btn"
            disabled={!inputText.trim() || isStreaming}
            aria-label={isEn ? 'Send message' : 'Enviar mensaje'}
          >
            {isEn ? 'Send' : 'Enviar'}
          </button>
        </form>

        {/* Failover / WhatsApp Handoff Footer */}
        <div className="llm-handoff-footer">
          <span>{isEn ? 'Need direct human discussion?' : '¿Prefieres trato directo con un ingeniero?'}</span>
          <a href={waLink(getWhatsAppHandoffMsg())} target="_blank" rel="noopener noreferrer" className="btn-handoff-wa">
            {isEn ? 'Chat via WhatsApp →' : 'Hablar por WhatsApp →'}
          </a>
        </div>
      </div>
    </div>
  );
}
