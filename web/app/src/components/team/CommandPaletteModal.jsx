import { useState, useEffect, useRef } from 'react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  projects = [],
  leads = [],
  onSelectProject,
  onSelectLead,
  onOpenNewProject,
  onOpenNewMilestone,
  onOpenNewDeliverable,
  onOpenNewStaff,
  isAdmin = false,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable items list
  const q = query.trim().toLowerCase();

  // Quick action items
  const actionItems = [];
  if (isAdmin) {
    if (onOpenNewProject) {
      actionItems.push({
        type: 'action',
        id: 'action-new-project',
        title: 'Registrar Nuevo Proyecto',
        category: 'Acción Rápida',
        icon: '🚀',
        action: onOpenNewProject,
      });
    }
    if (onOpenNewMilestone) {
      actionItems.push({
        type: 'action',
        id: 'action-new-milestone',
        title: 'Añadir Hito Metodológico',
        category: 'Acción Rápida',
        icon: '⚡',
        action: onOpenNewMilestone,
      });
    }
    if (onOpenNewDeliverable) {
      actionItems.push({
        type: 'action',
        id: 'action-new-deliverable',
        title: 'Subir Entregable Forense',
        category: 'Acción Rápida',
        icon: '📦',
        action: onOpenNewDeliverable,
      });
    }
    if (onOpenNewStaff) {
      actionItems.push({
        type: 'action',
        id: 'action-new-staff',
        title: 'Dar de Alta Consultor / Ingeniero',
        category: 'Acción Rápida',
        icon: '👥',
        action: onOpenNewStaff,
      });
    }
  }

  // Project items
  const projectItems = projects.map((p) => ({
    type: 'project',
    id: `project-${p.id}`,
    title: p.title || 'Proyecto sin título',
    category: `Proyecto · ${p.status || 'PLANIFICADO'}`,
    client: p.client?.full_name || p.client?.email || 'Inmerge Client',
    icon: '📂',
    raw: p,
    action: () => onSelectProject && onSelectProject(p),
  }));

  // Lead items
  const leadItems = leads.map((l) => ({
    type: 'lead',
    id: `lead-${l.id}`,
    title: `${l.company ? `${l.company} — ` : ''}${l.full_name || l.email || 'Solicitud TDR'}`,
    category: `Lead TDR · ${l.status || 'NUEVO'}`,
    pillar: l.pillar,
    icon: '📩',
    raw: l,
    action: () => onSelectLead && onSelectLead(l),
  }));

  // Filter items based on query
  const filteredActions = actionItems.filter(
    (item) => !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
  );

  const filteredProjects = projectItems.filter(
    (item) =>
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.client && item.client.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q),
  );

  const filteredLeads = leadItems.filter(
    (item) =>
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.pillar && item.pillar.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q),
  );

  const allFilteredItems = [...filteredActions, ...filteredProjects, ...filteredLeads];

  // Adjust selected index when list size changes
  useEffect(() => {
    if (selectedIndex >= allFilteredItems.length) {
      setSelectedIndex(Math.max(0, allFilteredItems.length - 1));
    }
  }, [allFilteredItems.length, selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allFilteredItems.length || 1));
      scrollSelectedIntoView((selectedIndex + 1) % (allFilteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allFilteredItems.length) % (allFilteredItems.length || 1));
      scrollSelectedIntoView((selectedIndex - 1 + allFilteredItems.length) % (allFilteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = allFilteredItems[selectedIndex];
      if (selectedItem && selectedItem.action) {
        selectedItem.action();
        onClose();
      }
    }
  };

  const scrollSelectedIntoView = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.command-palette-item');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  let currentRenderIndex = 0;

  return (
    <div
      className="command-palette-overlay is-open"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos y búsqueda global"
    >
      <div className="command-palette-container" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="command-palette-input-box">
          <span className="command-palette-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Buscar proyectos, leads TDR, entregables o ejecutar acción..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="command-palette-list"
          />
          <kbd className="command-palette-badge">ESC</kbd>
        </div>

        {/* Results List */}
        <div id="command-palette-list" className="command-palette-list" ref={listRef} role="listbox">
          {allFilteredItems.length === 0 ? (
            <div className="command-palette-empty">
              <p>No se encontraron resultados para &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <>
              {/* Acciones Rápidas */}
              {filteredActions.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-title">⚡ Acciones de Gestión</div>
                  {filteredActions.map((item) => {
                    const isSelected = currentRenderIndex === selectedIndex;
                    const itemIndex = currentRenderIndex;
                    currentRenderIndex++;
                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        className={`command-palette-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <span className="command-palette-item-icon">{item.icon}</span>
                        <div className="command-palette-item-content">
                          <div className="command-palette-item-title">{item.title}</div>
                          <div className="command-palette-item-meta">{item.category}</div>
                        </div>
                        <span className="command-palette-item-hint">Ejecutar ↵</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Proyectos Activos */}
              {filteredProjects.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-title">📂 Proyectos de Auditoría & Desarrollo</div>
                  {filteredProjects.map((item) => {
                    const isSelected = currentRenderIndex === selectedIndex;
                    const itemIndex = currentRenderIndex;
                    currentRenderIndex++;
                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        className={`command-palette-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <span className="command-palette-item-icon">{item.icon}</span>
                        <div className="command-palette-item-content">
                          <div className="command-palette-item-title">{item.title}</div>
                          <div className="command-palette-item-meta">
                            {item.category} • Cliente: {item.client}
                          </div>
                        </div>
                        <span className="command-palette-item-hint">Ir a proyecto →</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leads TDR */}
              {filteredLeads.length > 0 && (
                <div className="command-palette-section">
                  <div className="command-palette-section-title">📩 Solicitudes TDR & Oportunidades</div>
                  {filteredLeads.map((item) => {
                    const isSelected = currentRenderIndex === selectedIndex;
                    const itemIndex = currentRenderIndex;
                    currentRenderIndex++;
                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        className={`command-palette-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                      >
                        <span className="command-palette-item-icon">{item.icon}</span>
                        <div className="command-palette-item-content">
                          <div className="command-palette-item-title">{item.title}</div>
                          <div className="command-palette-item-meta">
                            {item.category} • Pilar: {item.pillar || 'N/A'}
                          </div>
                        </div>
                        <span className="command-palette-item-hint">Inspeccionar lead →</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="command-palette-footer">
          <div className="command-palette-shortcut-group">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>Navegar</span>
          </div>
          <div className="command-palette-shortcut-group">
            <kbd>↵</kbd>
            <span>Seleccionar</span>
          </div>
          <div className="command-palette-shortcut-group">
            <kbd>ESC</kbd>
            <span>Cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
