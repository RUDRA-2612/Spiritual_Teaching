import { RELIGIONS_DATA, DAILY_QUOTES, ACADEMY_INFO } from '../data.js';
import { appState } from '../state.js';
import { renderReligionSymbol } from '../utils/symbolHelper.js';

export function renderStudentHome() {
  const quote = DAILY_QUOTES[0];

  const ownedCourses = RELIGIONS_DATA.filter(religion => appState.ownsCourse(religion.id));
  const cardsHtml = ownedCourses.map(religion => {
    const { percent, completedCount, totalCount } = appState.getReligionProgress(religion.id);
    const symbolHtml = renderReligionSymbol(religion, 26);

    return `
      <div class="religion-card" data-religion-id="${religion.id}" style="--card-glow: ${religion.glowColor}; --religion-color: ${religion.color}">
        <!-- Card Header with Subtle Themed Artwork Banner -->
        <div class="card-header-art">
          <img src="${religion.artImage}" class="art-bg-img" alt="${religion.name}" />
          <div class="card-symbol-badge ${religion.id === 'sikhism' ? 'sikh-badge' : ''}">${symbolHtml}</div>
          <div class="card-title-meta">
            <div class="card-faith-name">${religion.name}</div>
            <div class="card-faith-sub">${religion.subname}</div>
          </div>
        </div>
        
        <div class="card-body">
          <div class="virtue-tags">
            ${religion.virtues.map(v => `<span class="v-tag" style="--v-accent: ${religion.color}">${v}</span>`).join('')}
          </div>

          <p class="card-description">${religion.summary}</p>

          <div class="progress-container">
            <div class="progress-info">
              <span class="progress-title">Course Progress</span>
              <span class="progress-num-badge" style="color: ${religion.color}; background: ${religion.glowColor.replace('0.45', '0.12')}">
                ${completedCount} / ${totalCount} Lectures (${percent}%)
              </span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percent}%; background: ${religion.color}; box-shadow: 0 0 10px ${religion.color}"></div>
            </div>
          </div>

          <button class="card-action-btn" data-enter-religion="${religion.id}" style="--btn-color: ${religion.color}">
            <span>Enter ${religion.name} Realm</span>
            <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="main-content">
      <!-- Clean, Elegant English Hero Banner -->
      <div class="hero-banner">
        <div class="hero-text">
          <div class="hero-badge">
            <i data-lucide="sparkles" style="width: 14px; height: 14px;"></i>
            <span>${ACADEMY_INFO.name} • Global Multi-Faith Academy</span>
          </div>
          <h2 class="hero-title">${ACADEMY_INFO.name}</h2>
          <div class="daily-quote-box">
            <div class="quote-header">
              <span class="quote-icon">🕊️</span>
              <span class="quote-title">Daily Reflection</span>
            </div>
            <div class="quote-body">
              "${quote.quote}"
            </div>
            <div class="quote-author">— ${quote.author}</div>
          </div>
        </div>
      </div>

      <!-- Section Title -->
      <div class="section-header">
        <div>
          <h2>
            <span>My Courses</span>
          </h2>
        </div>
      </div>

      <!-- Religions Cards Grid -->
      <div class="religions-grid">
        ${cardsHtml || '<div class="catalog-empty-state"><span>📚</span><h3>Your course library is empty</h3><p>Find a course to begin learning.</p></div>'}
      </div>
      <button class="find-courses-inline" data-open-course-catalog><i data-lucide="search" style="width: 17px; height: 17px;"></i><span>Find More Courses</span></button>
    </div>
  `;
}
