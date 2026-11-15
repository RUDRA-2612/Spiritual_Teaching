import { RELIGIONS_DATA } from '../data.js';
import { appState } from '../state.js';
import { renderReligionSymbol } from '../utils/symbolHelper.js';

export function renderParentHub(religionId) {
  const course = RELIGIONS_DATA.find(item => item.id === religionId);
  if (!course) return '<div>Course not found</div>';
  const listing = appState.getSellerListing(course.id);
  const sales = appState.getCourseSales(course.id);
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const lectures = course.lectures.map((lecture, index) => `<tr><td>${index + 1}</td><td>${lecture.title}</td><td>${lecture.duration}</td></tr>`).join('');

  return `
    <main class="main-content seller-course-detail">
      <div class="hub-header-bar"><button class="back-btn" id="btn-back-to-parent-home"><i data-lucide="arrow-left" style="width:16px;height:16px"></i><span>Back to Seller Dashboard</span></button></div>
      <section class="seller-course-hero" style="--seller-course-color:${course.color};--seller-course-bg:url('${course.artImage}')">
        <div class="seller-course-symbol">${renderReligionSymbol(course, 34)}</div>
        <div><span class="seller-eyebrow">COURSE LISTING</span><h2>${course.name}</h2><p>${course.summary}</p></div>
        <span class="seller-status ${listing.published ? 'published' : 'draft'}">${listing.published ? 'Published' : 'Draft'}</span>
      </section>
      <div class="seller-metrics-grid course-metrics-grid">
        <div class="seller-metric-card"><span>🛒</span><div><strong>${sales.length}</strong><small>Demo purchases</small></div></div>
        <div class="seller-metric-card"><span>💰</span><div><strong>₹${Number(revenue).toLocaleString('en-IN')}</strong><small>Demo gross sales</small></div></div>
        <div class="seller-metric-card"><span>🎬</span><div><strong>${course.lectures.length}</strong><small>Video lectures</small></div></div>
        <div class="seller-metric-card"><span>📚</span><div><strong>${course.stories.length}</strong><small>Moral stories</small></div></div>
      </div>
      <section class="seller-panel">
        <div class="seller-panel-heading"><div><h3>Listing settings</h3><p>Update the demo price and availability in the student catalog.</p></div></div>
        <form class="seller-listing-form" data-save-seller-listing="${course.id}">
          <label>Demo price (INR)<input type="number" name="course-price" min="0" step="1" value="${Number(listing.price)}" required><small>Demo only. No payment will be collected.</small></label>
          <label class="seller-publish-toggle"><input type="checkbox" name="course-published" ${listing.published ? 'checked' : ''}><span><strong>Published in course catalog</strong><small>Unpublished courses disappear from Find More Courses.</small></span></label>
          <button type="submit" class="submit-exam-btn">Save listing</button>
        </form>
      </section>
      <section class="seller-panel">
        <div class="seller-panel-heading"><div><h3>Course contents</h3><p>Review the learning material included in this listing.</p></div></div>
        <div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>#</th><th>Video lecture</th><th>Duration</th></tr></thead><tbody>${lectures}</tbody></table></div>
        <p class="seller-content-summary">Also included: ${course.stories.length} moral stories, ${course.teachings.length} core teachings, mindful practice, and a ${course.finalExam.length}-question final exam.</p>
      </section>
      <p class="seller-data-notice">Purchases and revenue shown here are local demo records from this browser, not verified customer transactions.</p>
    </main>
  `;
}
