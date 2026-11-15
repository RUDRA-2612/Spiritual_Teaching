import { RELIGIONS_DATA } from '../data.js';
import { appState } from '../state.js';

const lectureComparisons = {
  b1: ['Protecting life', 'Siddhartha protects the wounded swan. Other traditions also teach care for vulnerable life.', [['Hindu traditions', 'Ahimsa asks people to avoid harm.'], ['Jainism', 'Ahimsa extends careful regard to living beings.'], ['Islam', 'Hadith teach mercy toward animals.']]],
  b2: ['Stillness and reflection', 'The Bodhi Tree lesson values quiet attention. Many traditions make room for reflection and inner steadiness.', [['Hindu traditions', 'Meditative practice trains attention.'], ['Judaism', 'Shabbat creates a regular time for rest and reflection.'], ['Christianity', 'Prayer and contemplation offer space for stillness.']]],
  b3: ['Wise words and actions', 'The Eightfold Path connects ethical speech and action with a thoughtful way of living.', [['Hindu traditions', 'Dharma guides responsible action.'], ['Sikhism', 'Kirat Karo honors honest work.'], ['Judaism', 'Ethical speech and fair dealing are valued in daily life.']]],
  b4: ['Compassion in grief', 'Kisa Gotami learns that grief is shared across human lives; compassion can help people meet loss together.', [['Christianity', 'The Beatitudes offer comfort to those who mourn.'], ['Islam', 'Patience and care for grieving people are valued.'], ['Judaism', 'Community support is central in times of mourning.']]],
  h1: ['Every sincere effort matters', 'The squirrel contributes in a small way to a much larger task. Traditions often honor service according to intention, not status.', [['Sikhism', 'Seva values service offered for the good of others.'], ['Christianity', 'The widow’s small offering is praised for her sincerity.'], ['Islam', 'Even a small act of charity is encouraged.']]],
  h2: ['Respect and sacred light', 'Namaste expresses respect, while the diya symbolizes light and knowledge. Other traditions use greetings and lights to express care and hope.', [['Sikhism', 'Equality calls for respect toward every person.'], ['Judaism', 'Shabbat candles welcome a time of peace and gathering.'], ['Buddhism', 'Mindful awareness encourages respect in each encounter.']]],
  h3: ['Actions have consequences', 'The karma lesson connects choices with their effects. Other traditions also teach responsibility for the consequences of our actions, though their beliefs about this differ.', [['Sikhism', 'Kirat Karo emphasizes honest conduct.'], ['Christianity', 'Jesus teaches that good fruit grows from a good tree.'], ['Judaism', 'Tikkun Olam asks people to help repair harm in the world.']]],
  h4: ['A wider human family', 'Vasudhaiva Kutumbakam invites care beyond one’s immediate circle. Many traditions widen the circle of responsibility and belonging.', [['Sikhism', 'The langar welcomes people to eat together as equals.'], ['Buddhism', 'Loving-kindness practice extends goodwill widely.'], ['Judaism', 'The Torah repeatedly calls for care toward the stranger.']]]
};

const defaultComparison = ['Shared moral questions', 'This lesson connects with questions people across traditions have considered: how to care for others, act responsibly, and live well together.', [['Buddhism', 'Karuna encourages compassion.'], ['Sikhism', 'Seva encourages service.'], ['Judaism', 'Chesed describes loving-kindness.']]];

export function renderCrossFaithInsightModal() {
  const religion = RELIGIONS_DATA.find(item => item.id === appState.courseInsightReligionId);
  if (!religion) return '';
  const lecture = religion.lectures.find(item => item.id === appState.courseInsightLectureId);
  const [theme, comparison, relatedTeachings] = lectureComparisons[lecture?.id] || defaultComparison;

  return `
    <div class="modal-overlay" id="cross-faith-insight-overlay" role="presentation">
      <section class="cross-faith-insight-card" role="dialog" aria-modal="true" aria-labelledby="cross-faith-insight-title">
        <button class="cross-faith-insight-close" id="btn-close-cross-faith-insight" aria-label="Close">×</button>
        <div class="cross-faith-insight-icon">✨</div>
        <p class="cross-faith-insight-kicker">LECTURE COMPLETE · ${religion.name}</p>
        <h2 id="cross-faith-insight-title">Did you know?</h2>
        <p class="cross-faith-insight-lecture">${lecture?.title || ''}</p>
        <h3 class="cross-faith-insight-theme">${theme}</h3>
        <p class="cross-faith-insight-lead">${comparison}</p>
        <div class="cross-faith-teaching-list">
          ${relatedTeachings.map(([tradition, teaching]) => `<div class="cross-faith-teaching-row"><strong>${tradition}</strong><span>${teaching}</span></div>`).join('')}
        </div>
        <p class="cross-faith-insight-note">These teachings have their own meanings within each tradition; this is a shared theme, not a claim that the religions are the same.</p>
        <button class="submit-exam-btn cross-faith-insight-done" id="btn-done-cross-faith-insight">Continue learning</button>
      </section>
    </div>
  `;
}
