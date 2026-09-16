export default function StaffManagementView({ staffList, newStaff, setNewStaff, handleCreateStaff, staffSubmitting }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
      {/* Form: Register New Staff */}
      <div
        style={{
          background: 'var(--cream2)',
          padding: 24,
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}
      >
        <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
          Alta de Nuevo Colaborador / Consultor
        </h3>
        <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              placeholder="e.g. Andrea Valdivia"
              value={newStaff.fullName}
              onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Correo Institucional *
            </label>
            <input
              type="email"
              placeholder="colaborador@inmerge.pe"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Contraseña Inicial *
            </label>
            <input
              type="password"
              placeholder="Contraseña segura"
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
              Rol Asignado *
            </label>
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            >
              <option value="engineer">Ingeniero de Software / Cloud (engineer)</option>
              <option value="auditor">Auditor Técnico & Datos (auditor)</option>
              <option value="admin">Administrador General (admin)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={staffSubmitting}
            style={{
              background: 'var(--terracotta)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: staffSubmitting ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {staffSubmitting ? 'Registrando...' : 'Registrar Colaborador'}
          </button>
        </form>
      </div>

      {/* Staff List Table */}
      <div
        style={{
          background: 'var(--cream2)',
          padding: 24,
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}
      >
        <h3 style={{ fontFamily: "'Spectral', serif", fontSize: 20, margin: '0 0 16px', color: 'var(--ink)' }}>
          Equipo Interno ({staffList.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {staffList.map((st) => (
            <div
              key={st.id}
              style={{
                background: '#fff',
                padding: '12px 16px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{st.full_name || 'Sin nombre'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{st.email}</div>
              </div>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: st.role === 'admin' ? 'rgba(168,71,43,0.1)' : 'rgba(198,138,61,0.15)',
                  color: st.role === 'admin' ? 'var(--terracotta)' : 'var(--ochre)',
                  border: `1px solid ${st.role === 'admin' ? 'var(--terracotta)' : 'var(--ochre)'}`,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {st.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
