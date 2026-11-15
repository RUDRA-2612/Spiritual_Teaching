import { RELIGIONS_DATA } from '../data.js';
import { appState } from '../state.js';

const inr = amount => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export function renderParentHome() {
  const orders = appState.demoOrders;
  const revenue = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const liveCourses = RELIGIONS_DATA.filter(course => appState.getSellerListing(course.id).published).length;
  const courseRows = RELIGIONS_DATA.map(course => {
    const listing = appState.getSellerListing(course.id);
    const sales = appState.getCourseSales(course.id);
    const total = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    return `<tr>
      <td><strong>${course.name}</strong><small>${course.lectures.length} lessons · ${course.stories.length} stories · Final exam</small></td>
      <td><span class="seller-status ${listing.published ? 'published' : 'draft'}">${listing.published ? 'Published' : 'Draft'}</span></td>
      <td>${inr(listing.price)}</td>
      <td>${sales.length}</td>
      <td>${inr(total)}</td>
      <td><button class="seller-manage-btn" data-parent-enter-religion="${course.id}">Manage course</button></td>
    </tr>`;
  }).join('');
  const orderRows = orders.slice(0, 6).map(order => {
    const course = RELIGIONS_DATA.find(item => item.id === order.courseId);
    return `<tr><td>${order.id}</td><td>${course?.name || 'Course'}</td><td>${new Date(order.createdAt).toLocaleDateString()}</td><td>${inr(order.amount)}</td><td><span class="seller-status demo">Demo</span></td></tr>`;
  }).join('');

  return `
    <main class="main-content seller-dashboard">
      <header class="seller-welcome">
        <div><span class="seller-eyebrow">CREATOR STUDIO</span><h2>Course Seller Dashboard</h2><p>Manage course listings and review demo sales activity.</p></div>
        <span class="seller-sandbox-badge">Sandbox analytics</span>
      </header>
      <div class="seller-metrics-grid">
        <div class="seller-metric-card"><span>💰</span><div><strong>${inr(revenue)}</strong><small>Demo gross sales</small></div></div>
        <div class="seller-metric-card"><span>🛒</span><div><strong>${orders.length}</strong><small>Demo purchases</small></div></div>
        <div class="seller-metric-card"><span>📚</span><div><strong>${liveCourses} / ${RELIGIONS_DATA.length}</strong><small>Published courses</small></div></div>
        <div class="seller-metric-card"><span>🧾</span><div><strong>${RELIGIONS_DATA.length}</strong><small>Course listings</small></div></div>
      </div>
      <section class="seller-panel">
        <div class="seller-panel-heading"><div><h3>Course listings</h3><p>Set a demo price, publish or unpublish, and review course performance.</p></div></div>
        <div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>Course</th><th>Status</th><th>Price</th><th>Purchases</th><th>Demo gross</th><th></th></tr></thead><tbody>${courseRows}</tbody></table></div>
      </section>
      <section class="seller-panel">
        <div class="seller-panel-heading"><div><h3>Recent activity</h3><p>Latest demo checkout events saved in this browser.</p></div></div>
        ${orderRows ? `<div class="seller-table-wrap"><table class="seller-table"><thead><tr><th>Order</th><th>Course</th><th>Date</th><th>Amount</th><th>Type</th></tr></thead><tbody>${orderRows}</tbody></table></div>` : `<div class="seller-no-orders"><span>🧾</span><strong>No demo purchases yet</strong><p>Purchases made through the student course catalog will appear here in this browser.</p></div>`}
      </section>
      <p class="seller-data-notice">Seller metrics are local demo data. The app has no shared buyer database, payment processor, tax calculation, refund handling, or payout system.</p>
    </main>
  `;
}
