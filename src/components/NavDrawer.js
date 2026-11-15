import { RELIGIONS_DATA } from '../data.js';
import { appState } from '../state.js';
import { renderReligionSymbol } from '../utils/symbolHelper.js';

export function renderNavDrawer() {
  if (!appState.navDrawerOpen) return '';

  const visibleCourses = appState.currentRole === 'student'
    ? RELIGIONS_DATA.filter(rel => appState.ownsCourse(rel.id))
    : RELIGIONS_DATA;
  const faithsListHtml = visibleCourses.map(rel => {
    const { percent, completedCount, totalCount } = appState.getReligionProgress(rel.id);
    const symbolHtml = renderReligionSymbol(rel, 20);

    return `
      <div class="drawer-faith-row ${appState.selectedReligionId === rel.id ? 'active' : ''}" data-drawer-jump="${rel.id}">
        <div class="drawer-symbol-circle" style="background: ${rel.glowColor.replace('0.4', '0.2')}">
          ${symbolHtml}
        </div>
        <div class="drawer-faith-info">
          <div class="drawer-faith-name">${rel.name}</div>
          <div class="drawer-progress-text">
            <span>${completedCount}/${totalCount} Completed</span>
            <span style="color: ${rel.color}; font-weight: 800;">${percent}%</span>
          </div>
          <div class="drawer-progress-track">
            <div class="drawer-progress-fill" style="width: ${percent}%; background: ${rel.color};"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="drawer-backdrop" id="drawer-backdrop">
      <div class="nav-drawer-panel">
        <div class="drawer-header">
          <div class="drawer-title-box">
            <span class="drawer-header-icon">🧭</span>
            <div>
              <h3>Faith Navigator</h3>
              <span>Learning Course Progress</span>
            </div>
          </div>
          <button class="drawer-close-btn" id="btn-close-drawer">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>

        <!-- Student Summary Widget -->
        <div class="drawer-user-stats">
          <div class="drawer-stat-card">
            <span class="stat-number">⭐ ${appState.progress.stars}</span>
            <span class="stat-label">Stars Earned</span>
          </div>
          <div class="drawer-stat-card">
            <span class="stat-number">🔥 ${appState.progress.streak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>

        <div class="drawer-section-title">${appState.currentRole === 'student' ? 'My Courses' : 'All Courses'}</div>

        <!-- Faiths List -->
        <div class="drawer-faiths-list">
          ${faithsListHtml || '<p class="drawer-empty-courses">No courses in your library yet.</p>'}
        </div>

        <!-- Drawer Footer -->
        <div class="drawer-footer">
          ${appState.currentRole === 'student' ? `<button class="drawer-home-btn drawer-find-courses" id="btn-find-more-courses"><i data-lucide="search" style="width: 16px; height: 16px;"></i><span>Find More Courses</span></button>` : ''}
          <button class="drawer-home-btn" id="btn-drawer-home">
            <i data-lucide="home" style="width: 16px; height: 16px;"></i>
            <span>${appState.currentRole === 'student' ? 'My Courses' : 'Seller Dashboard'}</span>
          </button>

          <button class="drawer-logout-btn" id="btn-drawer-logout">
            <i data-lucide="log-out" style="width: 15px; height: 15px;"></i>
            <span>Log Out Portal</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
