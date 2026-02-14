// ============================================================
// Chatting Wizard School — Auth & Data Layer (Supabase)
// ============================================================
// SETUP: Replace these with your Supabase project values
// Found at: supabase.com > Your Project > Settings > API
// ============================================================
var SUPABASE_URL = 'https://bnmrdlqqzxenyqjknqhy.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJubXJkbHFxenhlbnlxamtucWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODIxNzMsImV4cCI6MjA4NjY1ODE3M30.do4TDZdu84GA_Ek37qZi2ZPGqzRKJs9N80opQQP6V90';

var _sb = null;

function sb() {
  if (!_sb) {
    if (typeof supabase === 'undefined') {
      console.error('Supabase JS not loaded. Add the CDN script.');
      return null;
    }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ============================================================
// AUTH
// ============================================================

async function getUser() {
  var client = sb();
  if (!client) return null;
  var res = await client.auth.getUser();
  return res.data && res.data.user ? res.data.user : null;
}

async function getUserProfile(userId) {
  var res = await sb().from('profiles').select('*').eq('id', userId).single();
  return res.data;
}

async function cwSignIn(email, password) {
  var res = await sb().auth.signInWithPassword({ email: email, password: password });
  if (res.error) throw res.error;
  return res.data;
}

async function cwSignUp(email, password, fullName, inviteCode) {
  // 1. Validate invite code first
  var check = await sb().rpc('validate_invite_code', { invite_code: inviteCode });
  if (check.error) throw check.error;
  if (!check.data) throw new Error('Invalid or already used invite code.');

  // 2. Create account
  var res = await sb().auth.signUp({
    email: email,
    password: password,
    options: { data: { full_name: fullName } }
  });
  if (res.error) throw res.error;

  // 3. Mark invite code as used
  if (res.data && res.data.user) {
    await sb().rpc('use_invite_code', {
      invite_code: inviteCode,
      for_user_id: res.data.user.id
    });
  }
  return res.data;
}

async function cwSignOut() {
  await sb().auth.signOut();
  window.location.href = 'login.html';
}

// ============================================================
// PROGRESS — Read / Write
// ============================================================

async function loadUserProgress(userId) {
  var results = await Promise.all([
    sb().from('progress').select('module_id').eq('user_id', userId),
    sb().from('quiz_results').select('*').eq('user_id', userId)
  ]);

  var completed = {};
  (results[0].data || []).forEach(function(r) { completed[r.module_id] = true; });

  var quizzes = {};
  (results[1].data || []).forEach(function(r) {
    quizzes[r.module_id] = {
      score: r.score,
      passed: r.passed,
      pct: r.percentage,
      timestamp: r.submitted_at
    };
  });

  return { completed: completed, quizzes: quizzes };
}

async function saveModuleComplete(userId, moduleId, isCompleted) {
  if (isCompleted) {
    await sb().from('progress').upsert({
      user_id: userId,
      module_id: moduleId,
      completed: true,
      updated_at: new Date().toISOString()
    });
  } else {
    await sb().from('progress').delete().eq('user_id', userId).eq('module_id', moduleId);
  }
}

async function saveQuizResult(userId, moduleId, score, pct, passed) {
  await sb().from('quiz_results').upsert({
    user_id: userId,
    module_id: moduleId,
    score: score,
    percentage: pct,
    passed: passed,
    submitted_at: new Date().toISOString()
  });
}

// ============================================================
// CONTENT GATING
// ============================================================

function getSectionGates() {
  return {
    tools: 't-1',
    journey: 'j-1',
    advanced: 'a-1',
    golive: 'g-1'
  };
}

function getUnlockedSections(quizResults, manualUnlocks) {
  var gates = getSectionGates();
  var unlocked = { foundations: true, ongoing: true };
  var overrides = manualUnlocks || [];
  Object.keys(gates).forEach(function(sectionId) {
    var gateQuiz = gates[sectionId];
    var result = quizResults[gateQuiz];
    var passedQuiz = !!(result && result.passed);
    var manuallyUnlocked = overrides.indexOf(sectionId) >= 0;
    unlocked[sectionId] = passedQuiz || manuallyUnlocked;
  });
  return unlocked;
}

// ============================================================
// MIGRATION — localStorage to Supabase (one-time)
// ============================================================

async function migrateLocalStorage(userId) {
  var STORAGE_KEY = 'cw-school-progress';
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    var data = JSON.parse(raw);

    if (data.completed) {
      var progressRows = Object.keys(data.completed).map(function(moduleId) {
        return {
          user_id: userId,
          module_id: moduleId,
          completed: true,
          updated_at: new Date().toISOString()
        };
      });
      if (progressRows.length > 0) {
        await sb().from('progress').upsert(progressRows);
      }
    }

    if (data.quizzes) {
      var quizRows = Object.keys(data.quizzes).map(function(moduleId) {
        var q = data.quizzes[moduleId];
        return {
          user_id: userId,
          module_id: moduleId,
          score: q.score || '0/0',
          percentage: q.pct || 0,
          passed: !!q.passed,
          submitted_at: q.timestamp || new Date().toISOString()
        };
      });
      if (quizRows.length > 0) {
        await sb().from('quiz_results').upsert(quizRows);
      }
    }

    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('localStorage migration failed:', e);
  }
}

// ============================================================
// ADMIN — Functions for admin panel
// ============================================================

async function adminGetStudents() {
  var res = await sb().rpc('admin_get_students');
  if (res.error) throw res.error;
  return res.data || [];
}

async function adminGenerateInvite() {
  var res = await sb().rpc('generate_invite_code');
  if (res.error) throw res.error;
  return res.data;
}

async function adminGetInviteCodes() {
  var res = await sb().from('invite_codes').select('*').order('created_at', { ascending: false });
  if (res.error) throw res.error;
  return res.data || [];
}

async function loadUserUnlocks(userId) {
  var res = await sb().from('section_unlocks').select('section_id').eq('user_id', userId);
  return (res.data || []).map(function(r) { return r.section_id; });
}

async function adminGrantSection(targetId, sectionId) {
  var res = await sb().rpc('admin_grant_section', { target_id: targetId, sect_id: sectionId });
  if (res.error) throw res.error;
}

async function adminRevokeSection(targetId, sectionId) {
  var res = await sb().rpc('admin_revoke_section', { target_id: targetId, sect_id: sectionId });
  if (res.error) throw res.error;
}

async function adminUpdateStudent(targetId, newName, newRole) {
  var res = await sb().rpc('admin_update_student', {
    target_id: targetId,
    new_name: newName || null,
    new_role: newRole || null
  });
  if (res.error) throw res.error;
}

async function adminResetProgress(targetId) {
  var res = await sb().rpc('admin_reset_progress', { target_id: targetId });
  if (res.error) throw res.error;
}

async function adminResetQuizzes(targetId) {
  var res = await sb().rpc('admin_reset_quizzes', { target_id: targetId });
  if (res.error) throw res.error;
}
