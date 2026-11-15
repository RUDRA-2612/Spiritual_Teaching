import confetti from 'canvas-confetti';
import { RELIGIONS_DATA, DAILY_QUOTES } from './data.js';

class AppState {
  constructor() {
    this.isLoggedIn = true; // true = inside portal, false = portal select screen
    this.currentRole = 'student'; // 'student' | 'parent'
    this.selectedReligionId = null; // null = home, string = realm hub
    this.showCourseCatalog = false;
    this.courseInsightReligionId = null;
    this.courseInsightLectureId = null;
    this.activeHubTab = 'lectures'; // 'lectures' | 'stories' | 'teachings' | 'calm' | 'exam'
    this.activeChild = 'rudra'; // 'rudra' | 'ananya'
    this.soundEnabled = true;

    // Active sub-item states
    this.activeLectureId = null;
    this.activeStoryId = null;
    this.activeTeachingModal = null; // { religionId, teachingIndex } or null
    this.navDrawerOpen = false;
    this.profileModalOpen = false;

    // Authentic Sacred Audio Player State
    this.currentAudio = null;
    this.ambientChantPlaying = false;
    this.currentChantReligionId = null;
    this.lastNavigationTime = 0;

    // Load progress from localStorage (v3 for rich interactive data)
    const savedProgress = localStorage.getItem('unisoul_progress_v3') || localStorage.getItem('omniwisdom_progress_v3');
    if (savedProgress) {
      try {
        this.progress = JSON.parse(savedProgress);
      } catch (e) {
        this.progress = this.getDefaultProgress();
      }
    } else {
      this.progress = this.getDefaultProgress();
    }

    this.resetStarterCourseProgress();

    this.ownedCourseIds = this.loadOwnedCourseIds();
    this.removeSikhismFromCurrentLibrary();
    this.sellerCatalog = this.loadSellerCatalog();
    this.demoOrders = this.loadDemoOrders();

    this.audioCtx = null;
    this.subscribers = [];

    // Setup history listening
    this.setupHistoryListener();
  }

  getDefaultProgress() {
    return {
      stars: 420,
      streak: 5,
      completedLectures: {
        's1': true, // Sikhism: 1 / 4
        'i1': true, // Islam: 1 / 4
      },
      lectureQuizzes: {},
      examScores: {} // Clean so exams are ready to take
    };
  }

  resetStarterCourseProgress() {
    if (localStorage.getItem('unisoul_buddhism_hinduism_zero_v1')) return;
    const starterCourseIds = new Set(['buddhism', 'hinduism']);
    const lectureIds = RELIGIONS_DATA
      .filter(religion => starterCourseIds.has(religion.id))
      .flatMap(religion => religion.lectures.map(lecture => lecture.id));
    if (!this.progress.completedLectures) this.progress.completedLectures = {};
    if (!this.progress.lectureQuizzes) this.progress.lectureQuizzes = {};
    if (!this.progress.dismissedCourseInsights) this.progress.dismissedCourseInsights = {};
    lectureIds.forEach(id => {
      delete this.progress.completedLectures[id];
      delete this.progress.lectureQuizzes[id];
      delete this.progress.dismissedCourseInsights[id];
    });
    delete this.progress.examScores?.buddhism;
    delete this.progress.examScores?.hinduism;
    localStorage.setItem('unisoul_progress_v3', JSON.stringify(this.progress));
    localStorage.setItem('unisoul_buddhism_hinduism_zero_v1', 'true');
  }

  loadOwnedCourseIds() {
    const savedCourses = localStorage.getItem('unisoul_owned_courses_v2');
    if (savedCourses) {
      try {
        const ids = JSON.parse(savedCourses);
        if (Array.isArray(ids)) return ids.filter(id => RELIGIONS_DATA.some(religion => religion.id === id));
      } catch (e) {}
    }

    // Start the current learner with the two requested courses. This one-time
    // ownership migration also trims the previous all-course demo library.
    const owned = ['buddhism', 'hinduism'];
    localStorage.setItem('unisoul_owned_courses_v2', JSON.stringify(owned));
    return owned;
  }

  ownsCourse(courseId) {
    return this.ownedCourseIds.includes(courseId);
  }

  removeSikhismFromCurrentLibrary() {
    const migrationKey = 'unisoul_remove_sikhism_from_current_user_v1';
    if (localStorage.getItem(migrationKey)) return;
    this.ownedCourseIds = this.ownedCourseIds.filter(courseId => courseId !== 'sikhism');
    localStorage.setItem('unisoul_owned_courses_v2', JSON.stringify(this.ownedCourseIds));
    localStorage.setItem(migrationKey, 'true');
  }

  loadSellerCatalog() {
    try {
      return JSON.parse(localStorage.getItem('unisoul_seller_catalog_v1') || '{}');
    } catch (e) {
      return {};
    }
  }

  loadDemoOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem('unisoul_demo_orders_v1') || '[]');
      return Array.isArray(orders) ? orders : [];
    } catch (e) {
      return [];
    }
  }

  getSellerListing(courseId) {
    return this.sellerCatalog[courseId] || { price: 499, published: true };
  }

  updateSellerListing(courseId, listing) {
    const current = this.getSellerListing(courseId);
    const price = Math.max(0, Number(listing.price ?? current.price) || 0);
    this.sellerCatalog[courseId] = { ...current, ...listing, price };
    localStorage.setItem('unisoul_seller_catalog_v1', JSON.stringify(this.sellerCatalog));
    this.notify();
  }

  getCourseSales(courseId) {
    return this.demoOrders.filter(order => order.courseId === courseId);
  }

  addOwnedCourse(courseId) {
    if (!RELIGIONS_DATA.some(religion => religion.id === courseId) || this.ownsCourse(courseId)) return;
    const listing = this.getSellerListing(courseId);
    if (!listing.published) return;
    const order = {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      courseId,
      amount: listing.price,
      createdAt: new Date().toISOString()
    };
    this.demoOrders = [order, ...this.demoOrders];
    localStorage.setItem('unisoul_demo_orders_v1', JSON.stringify(this.demoOrders));
    this.ownedCourseIds = [...this.ownedCourseIds, courseId];
    localStorage.setItem('unisoul_owned_courses_v2', JSON.stringify(this.ownedCourseIds));
    this.showCourseCatalog = true;
    this.notify();
  }

  openCourseCatalog() {
    this.selectedReligionId = null;
    this.showCourseCatalog = true;
    this.navDrawerOpen = false;
    this.stopAmbientChant();
    this.pushState(false);
    this.notify();
  }

  save() {
    localStorage.setItem('unisoul_progress_v3', JSON.stringify(this.progress));
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this));
  }

  // ==========================================
  // HISTORY API & ROUTING (TOUCHPAD BACK SUPPORT)
  // ==========================================
  // ==========================================
  // HISTORY API & ROUTING (TOUCHPAD BACK SUPPORT)
  // ==========================================
  setupHistoryListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'unisoul_demo_orders_v1' && event.newValue) {
        try {
          this.demoOrders = JSON.parse(event.newValue) || [];
        } catch (e) {
          this.demoOrders = [];
        }
        this.notify();
      }
      if (event.key === 'unisoul_owned_courses_v2' && event.newValue) {
        try {
          this.ownedCourseIds = JSON.parse(event.newValue) || [];
        } catch (e) {
          this.ownedCourseIds = [];
        }
        this.notify();
      }
      if (event.key === 'unisoul_seller_catalog_v1' && event.newValue) {
        try {
          this.sellerCatalog = JSON.parse(event.newValue) || {};
        } catch (e) {
          this.sellerCatalog = {};
        }
        this.notify();
      }
    });

    window.addEventListener('popstate', (e) => {
      // Whenever user swipes back on touchpad or clicks browser back
      if (e.state && typeof e.state.isLoggedIn === 'boolean') {
        this.applyStateFromHistory(e.state);
      } else {
        // Fallback for root history entry: navigate back to Home
        this.applyStateFromHistory({
          isLoggedIn: true,
          currentRole: this.currentRole,
          selectedReligionId: null,
          activeHubTab: 'lectures',
          activeLectureId: null,
          activeStoryId: null,
          activeTeachingModal: null,
          activeChild: this.activeChild
        });
      }
    });

    // Initial state replace
    this.pushState(true);
  }

  pushState(replace = false) {
    const stateObj = {
      isLoggedIn: this.isLoggedIn,
      currentRole: this.currentRole,
      selectedReligionId: this.selectedReligionId,
      showCourseCatalog: this.showCourseCatalog,
      activeHubTab: this.activeHubTab,
      activeLectureId: this.activeLectureId,
      activeStoryId: this.activeStoryId,
      activeTeachingModal: this.activeTeachingModal,
      activeChild: this.activeChild
    };

    let hash = '#/home';
    if (!this.isLoggedIn) {
      hash = '#/portal-select';
    } else if (this.currentRole === 'parent') {
      hash = this.selectedReligionId ? `#/parent/${this.selectedReligionId}` : '#/parent';
    } else if (this.showCourseCatalog) {
      hash = '#/courses';
    } else if (this.selectedReligionId) {
      hash = `#/realm/${this.selectedReligionId}`;
    }

    try {
      if (replace) {
        window.history.replaceState(stateObj, '', hash);
      } else {
        window.history.pushState(stateObj, '', hash);
      }
    } catch (e) {
      // Ignore security errors in restricted iframes if any
    }
  }

  applyStateFromHistory(stateObj) {
    if (!stateObj) return;

    this.isLoggedIn = stateObj.isLoggedIn ?? true;
    this.currentRole = stateObj.currentRole ?? 'student';

    // Only stop audio if religion changed or returned to home
    if (this.selectedReligionId !== stateObj.selectedReligionId) {
      this.stopAmbientChant();
    }

    this.selectedReligionId = stateObj.selectedReligionId ?? null;
    this.showCourseCatalog = stateObj.showCourseCatalog ?? false;
    this.activeHubTab = stateObj.activeHubTab ?? 'lectures';
    this.activeLectureId = stateObj.activeLectureId ?? null;
    this.activeStoryId = stateObj.activeStoryId ?? null;
    this.activeTeachingModal = stateObj.activeTeachingModal ?? null;
    this.activeChild = stateObj.activeChild ?? 'rudra';
    this.navDrawerOpen = false;
    this.profileModalOpen = false;

    this.notify();
  }

  // ==========================================
  // AUTH & PORTAL SELECTION
  // ==========================================
  loginAs(role) {
    this.isLoggedIn = true;
    this.currentRole = role;
    this.selectedReligionId = null;
    this.navDrawerOpen = false;
    this.profileModalOpen = false;
    this.pushState();
    this.notify();
    this.playChime('harp');
  }

  logout() {
    this.stopAmbientChant();
    this.isLoggedIn = false;
    this.selectedReligionId = null;
    this.navDrawerOpen = false;
    this.profileModalOpen = false;
    this.pushState();
    this.notify();
    this.playChime('harp');
  }

  // ==========================================
  // NAVIGATION ACTIONS
  // ==========================================
  selectReligion(religionId) {
    if (this.currentRole === 'student' && !this.ownsCourse(religionId)) {
      this.openCourseCatalog();
      return;
    }
    this.lastNavigationTime = Date.now();
    this.showCourseCatalog = false;
    this.selectedReligionId = religionId;
    this.activeHubTab = 'lectures';
    const religion = RELIGIONS_DATA.find(r => r.id === religionId);
    if (religion) {
      this.activeLectureId = religion.lectures[0]?.id || null;
      this.activeStoryId = religion.stories[0]?.id || null;
    }
    this.activeTeachingModal = null;
    this.navDrawerOpen = false;

    // A realm change should not carry audio from the previous realm forward.
    // Chants start only when the learner presses the audio control.
    if (this.currentChantReligionId && this.currentChantReligionId !== religionId) {
      this.stopAmbientChant();
    }

    // Push new history state so touchpad back can return to Home
    this.pushState(false);
    this.notify();
  }

  clearSelectedReligion() {
    this.selectedReligionId = null;
    this.showCourseCatalog = false;
    this.activeTeachingModal = null;
    this.navDrawerOpen = false;
    this.stopAmbientChant();
    this.pushState(false);
    this.notify();
  }

  setHubTab(tabName) {
    this.activeHubTab = tabName;
    // Replace state so sub-tabs don't clutter back history
    this.pushState(true);
    this.notify();
  }

  setActiveLecture(lectureId) {
    this.activeLectureId = lectureId;
    this.pushState(true);
    this.notify();
  }

  setActiveStory(storyId) {
    this.activeStoryId = storyId;
    this.pushState(true);
    this.notify();
  }

  openTeachingModal(religionId, index) {
    this.activeTeachingModal = { religionId, index };
    this.pushState(true);
    this.notify();
    this.playChime('harp');
  }

  closeTeachingModal() {
    this.activeTeachingModal = null;
    this.pushState(true);
    this.notify();
  }

  toggleNavDrawer(open) {
    this.navDrawerOpen = open !== undefined ? open : !this.navDrawerOpen;
    this.notify();
  }

  toggleProfileModal(open) {
    this.profileModalOpen = open !== undefined ? open : !this.profileModalOpen;
    this.notify();
  }

  setActiveChild(childName) {
    this.activeChild = childName;
    this.notify();
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) {
      this.stopAmbientChant();
    }
    this.notify();
  }

  // ==========================================
  // LEARNING ACHIEVEMENTS
  // ==========================================
  markLectureCompleted(lectureId) {
    if (!this.progress.lectureQuizzes?.[lectureId]) return false;
    if (!this.progress.completedLectures[lectureId]) {
      this.progress.completedLectures[lectureId] = true;
      this.progress.stars += 25;
      const religion = RELIGIONS_DATA.find(course => course.lectures.some(lecture => lecture.id === lectureId));
      if (religion) this.maybeTriggerCourseInsight(religion.id, lectureId);
      this.save();
      this.triggerConfetti();
      this.playChime('correct');
      return true;
    }
    return false;
  }

  dismissCourseInsight() {
    if (this.courseInsightLectureId) {
      if (!this.progress.dismissedCourseInsights) this.progress.dismissedCourseInsights = {};
      this.progress.dismissedCourseInsights[this.courseInsightLectureId] = true;
      localStorage.setItem('unisoul_progress_v3', JSON.stringify(this.progress));
    }
    this.courseInsightReligionId = null;
    this.courseInsightLectureId = null;
    this.notify();
  }

  maybeTriggerCourseInsight(religionId, lectureId = this.activeLectureId) {
    if (!religionId || !lectureId || this.progress.dismissedCourseInsights?.[lectureId]) return false;
    const religion = RELIGIONS_DATA.find(course => course.id === religionId);
    if (religion?.lectures.some(lecture => lecture.id === lectureId) && this.progress.completedLectures[lectureId]) {
      this.courseInsightReligionId = religionId;
      this.courseInsightLectureId = lectureId;
      return true;
    }
    return false;
  }

  markLectureQuizPassed(lectureId) {
    if (!this.progress.lectureQuizzes) this.progress.lectureQuizzes = {};
    if (this.progress.lectureQuizzes[lectureId]) return;
    this.progress.lectureQuizzes[lectureId] = true;
    this.save();
    this.triggerConfetti();
    this.playChime('correct');
  }

  saveExamScore(religionId, score, grade) {
    this.progress.examScores[religionId] = {
      score: score,
      grade: grade,
      date: 'Just Now'
    };
    this.progress.stars += 50;
    this.save();
    this.triggerConfetti();
    this.playChime('correct');
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }

  // ==========================================
  // AUDIO ENGINE (AUTHENTIC CHANTS + CHIMES)
  // ==========================================
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playChime(type = 'singingBowl') {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => this._executeChime(type));
      } else {
        this._executeChime(type);
      }
    } catch (e) {
      console.warn('Audio chime warning:', e);
    }
  }

  _executeChime(type) {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (type === 'singingBowl') {
      const freqs = [432, 864, 1296];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.2 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.9);
      });
    } else if (type === 'templeBell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 2.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.6);
    } else if (type === 'harp') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 1.9);
      });
    } else if (type === 'flute') {
      const notes = [440, 493.88, 554.37, 659.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.2);
        gain.gain.setValueAtTime(0.1, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.2 + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 1.5);
      });
    } else if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.14);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.95);
    }
  }

  // ==========================================
  // REAL AUDIO CHANT PLAYER
  // ==========================================
  toggleAmbientChant(religionId) {
    if (this.ambientChantPlaying && this.currentChantReligionId === religionId) {
      this.stopAmbientChant();
      this.updateChantButtonUI();
    } else {
      this.startAmbientChant(religionId);
    }
  }

  startAmbientChant(religionId) {
    if (this.currentAudio && this.currentChantReligionId === religionId && this.ambientChantPlaying) {
      return; // Already playing smoothly!
    }

    this.stopAmbientChant();
    const religion = RELIGIONS_DATA.find(r => r.id === religionId);
    if (!religion || !religion.ambientChant?.audioSrc) return;

    try {
      const audio = new Audio(religion.ambientChant.audioSrc);
      audio.loop = true;
      audio.volume = 0.85;
      this.currentAudio = audio;
      this.currentChantReligionId = religionId;
      this.ambientChantPlaying = true;

      audio.addEventListener('error', (e) => {
        console.warn('Audio playback error', e);
        this.ambientChantPlaying = false;
        this.updateChantButtonUI();
      });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.ambientChantPlaying = true;
          this.updateChantButtonUI();
        }).catch(err => {
          console.warn('Audio play prevented or interaction needed:', err);
          this.ambientChantPlaying = false;
          this.updateChantButtonUI();
        });
      }
    } catch (err) {
      console.warn('Error starting audio chant:', err);
      this.ambientChantPlaying = false;
      this.updateChantButtonUI();
    }
  }

  updateChantButtonUI() {
    const btn = document.getElementById('btn-ambient-chant-toggle');
    if (!btn) return;
    const religion = RELIGIONS_DATA.find(r => r.id === this.selectedReligionId);
    if (!religion) return;

    if (this.ambientChantPlaying) {
      btn.classList.add('playing');
      btn.title = 'Click to Pause Sacred Audio';
      btn.innerHTML = `
        <div class="equalizer-anim">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
        <div class="chant-btn-text">
          <span class="chant-btn-title">🔊 Playing: ${religion.ambientChant.name}</span>
          <span class="chant-btn-sub">Click to Pause Audio</span>
        </div>
      `;
    } else {
      btn.classList.remove('playing');
      btn.title = 'Click to Play Sacred Audio';
      btn.innerHTML = `
        <div class="chant-play-icon" style="background: ${religion.color}">
          <i data-lucide="volume-2" style="width: 16px; height: 16px; color: #fff;"></i>
        </div>
        <div class="chant-btn-text">
          <span class="chant-btn-title">▶️ Play Sacred Audio</span>
          <span class="chant-track-sub">${religion.ambientChant.name}</span>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  stopAmbientChant() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    this.ambientChantPlaying = false;
    this.currentChantReligionId = null;
    this.updateChantButtonUI();
  }

  getReligionProgress(religionId) {
    const religion = RELIGIONS_DATA.find(r => r.id === religionId);
    if (!religion) return { percent: 0, completedCount: 0, totalCount: 0 };

    const totalCount = religion.lectures.length;
    let completedCount = 0;
    religion.lectures.forEach(lec => {
      if (this.progress.completedLectures[lec.id]) {
        completedCount++;
      }
    });

    const percent = Math.round((completedCount / totalCount) * 100);
    return { percent, completedCount, totalCount };
  }
}

export const appState = new AppState();
