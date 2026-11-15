import { RELIGIONS_DATA } from '../data.js';
import { appState } from '../state.js';
import { renderReligionSymbol } from '../utils/symbolHelper.js';

export function renderCourseCatalog() {
  const coursesHtml = RELIGIONS_DATA.filter(course => !appState.ownsCourse(course.id) && appState.getSellerListing(course.id).published).map(course => {
    const listing = appState.getSellerListing(course.id);
    return `
    <article class="religion-card catalog-course-card" style="--card-glow: ${course.glowColor}; --religion-color: ${course.color}">
      <div class="card-header-art">
        <img src="${course.artImage}" class="art-bg-img" alt="" />
        <div class="card-symbol-badge">${renderReligionSymbol(course, 26)}</div>
        <div class="card-title-meta">
          <div class="card-faith-name">${course.name}</div>
          <div class="card-faith-sub">${course.subname}</div>
        </div>
      </div>
      <div class="card-body">
        <p class="card-description">${course.summary}</p>
        <div class="catalog-course-meta">
          <strong>₹${Number(listing.price).toLocaleString('en-IN')} · Base demo price</strong>
          <span>🎬 ${course.lectures.length} video lectures</span>
          <span>📚 ${course.stories.length} stories</span>
          <span>📝 Final exam included</span>
        </div>
        <button class="card-action-btn catalog-buy-btn" data-buy-course="${course.id}" style="--btn-color: ${course.color}">
          <span>Buy Course · Demo Unlock</span>
          <i data-lucide="shopping-bag" style="width: 16px; height: 16px;"></i>
        </button>
        <p class="catalog-demo-note">Demo checkout only: no payment is processed. Access and sales are stored in this browser.</p>
      </div>
    </article>
  `;
  }).join('');

  return `
    <main class="main-content course-catalog-view">
      <div class="course-catalog-heading">
        <div>
          <span class="catalog-eyebrow">COURSE CATALOG</span>
          <h2>Find More Courses</h2>
          <p>Choose another tradition to add to your learning library.</p>
        </div>
        <button class="back-btn" id="btn-my-courses">← My Courses</button>
      </div>
      ${coursesHtml
        ? `<div class="religions-grid">${coursesHtml}</div>`
        : `<div class="catalog-empty-state"><span>🎉</span><h3>No more published courses right now</h3><p>You own all currently available courses.</p></div>`}
    </main>
  `;
}
