import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { STACK_CATEGORIES as fallbackCategories } from '../data/stack.js';

export default function StackTabs() {
  const { stack } = useLanguage();
  const categories = stack?.STACK_CATEGORIES || fallbackCategories;
  const [activeTab, setActiveTab] = useState(categories[0].id);

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];

  return (
    <div style={{ margin: '40px 0' }}>
      {/* Tab Navigation */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 16,
          marginBottom: 32,
        }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeTab;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              style={{
                background: isActive ? 'var(--terracotta)' : 'transparent',
                color: isActive ? '#F3EADA' : 'var(--ink)',
                border: '1px solid',
                borderColor: isActive ? 'var(--terracotta)' : 'var(--border)',
                padding: '10px 20px',
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '16px 0',
          transition: 'opacity 0.25s ease',
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontFamily: "'Spectral', serif",
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 700,
              margin: '0 0 8px 0',
              color: 'var(--ink)',
            }}
          >
            {currentCategory.name}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 16, margin: 0, maxWidth: 680 }}>{currentCategory.desc}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(20px, 3vw, 32px)',
          }}
        >
          {currentCategory.tools.map((tool) => (
            <div
              key={tool.name}
              style={{
                background: 'transparent',
                borderTop: '1px solid var(--border)',
                padding: '16px 0 8px 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 16,
                      color: 'var(--ink)',
                    }}
                  >
                    {tool.name}
                  </h4>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      color: 'var(--terracotta)',
                      fontWeight: 600,
                    }}
                  >
                    {tool.level}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{tool.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
