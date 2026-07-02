const STORAGE_KEY_ID = 'learner_user_id';
const STORAGE_KEY_NAME = 'learner_user_name';

export function getUserId() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_ID) || '';
}

export function getUserName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_NAME) || '';
}

export function isLoggedIn() {
  return !!getUserId();
}

export function setUser(id, name) {
  localStorage.setItem(STORAGE_KEY_ID, id);
  localStorage.setItem(STORAGE_KEY_NAME, name);
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY_ID);
  localStorage.removeItem(STORAGE_KEY_NAME);
}

export function logout() {
  clearUser();
  window.location.href = '/login';
}
