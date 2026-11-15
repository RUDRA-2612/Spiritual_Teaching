export function renderPortalGate() {
  return `
    <div class="portal-gate-wrapper">
      <div class="portal-gate-container">
        <div class="portal-brand-header">
          <div class="portal-brand-icon">🌟</div>
          <h1>UniSoul</h1>
          <p class="portal-brand-tagline">Universal Moral Values, Sacred Heritage & Cultural Harmony</p>
        </div>

        <div class="portal-selection-intro">
          <h2>Choose a Portal</h2>
          <p>Enter your course library or manage courses as a seller.</p>
        </div>

        <div class="portal-cards-grid">
          <!-- Student Portal Card -->
          <div class="portal-card student-card" id="btn-select-student-portal">
            <div class="portal-badge student">Young Explorer</div>
            <div class="portal-icon-box">🎒</div>
            <h3>Student Portal</h3>
            <p class="portal-desc">
              Immerse yourself in interactive video lessons, authentic sacred mantras, illustrated moral stories, and earn official wisdom certificates.
            </p>
            <ul class="portal-features-list">
              <li><span>🎬</span> Animated Video Parables & Lessons</li>
              <li><span>🔊</span> Authentic Sacred Vocal Audio Chants</li>
              <li><span>📚</span> Multi-faith Illustrated Storybooks</li>
              <li><span>🏆</span> Interactive Quizzes & Honors</li>
            </ul>
            <button class="portal-enter-btn student">
              <span>Enter Student Mode</span>
              <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <!-- Course Seller Portal Card -->
          <div class="portal-card parent-card" id="btn-select-parent-portal">
            <div class="portal-badge parent">Course Creator</div>
            <div class="portal-icon-box">🛍️</div>
            <h3>Course Seller Portal</h3>
            <p class="portal-desc">
              Publish and manage courses, set demo prices, and review purchase activity and course performance.
            </p>
            <ul class="portal-features-list">
              <li><span>📊</span> Course listing and sales dashboard</li>
              <li><span>💰</span> Demo pricing and gross sales</li>
              <li><span>📚</span> Manage published course content</li>
              <li><span>🧾</span> Recent demo purchase activity</li>
            </ul>
            <button class="portal-enter-btn parent">
              <span>Enter Seller Portal</span>
              <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>

        <div class="portal-footer-notice">
          <span>🔒 Safe, Ad-Free & Secularly Balanced Moral Education for Children Worldwide</span>
        </div>
      </div>
    </div>
  `;
}
